import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Ты - дружелюбный ассистент интернет-магазина воздушных шаров FlyArt в Краснодаре.

Твои задачи:
- Помогать клиентам выбрать воздушные шары и композиции для любых событий
- Отвечать на вопросы о доставке, ценах и условиях заказа
- Консультировать по оформлению праздников
- Искать и рекомендовать подходящие товары из каталога

Информация о магазине:
- Работаем ежедневно с 9:00 до 21:00
- Доставка по Краснодару от 300₽
- Самовывоз бесплатно
- Принимаем заказы на любые даты
- Есть композиции для дней рождения, свадеб, выписок из роддома, корпоративов

ВАЖНО: Когда клиент спрашивает о товарах или хочет что-то купить/посмотреть, ОБЯЗАТЕЛЬНО используй функцию search_products для поиска в каталоге. Например:
- "покажи шары на день рождения" -> search_products
- "что есть для свадьбы" -> search_products  
- "хочу розовые шары" -> search_products
- "сколько стоят шары" -> search_products

Будь вежливым, полезным и отвечай кратко.`;

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Поиск товаров в каталоге магазина по ключевым словам. Используй когда клиент спрашивает о товарах, ценах, хочет что-то посмотреть или купить.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Поисковый запрос: название товара, тип события (день рождения, свадьба), цвет, или другие характеристики"
          },
          limit: {
            type: "number",
            description: "Количество товаров для показа (по умолчанию 4, максимум 8)"
          }
        },
        required: ["query"]
      }
    }
  }
];

async function searchProducts(supabase: any, query: string, limit: number = 4) {
  console.log('Searching products with query:', query, 'limit:', limit);
  
  const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
  
  let queryBuilder = supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      price,
      price_old,
      description,
      is_hit,
      is_new,
      is_sale,
      product_images!inner(url, is_main)
    `)
    .eq('is_active', true)
    .limit(Math.min(limit, 8));

  // Build OR conditions for search
  if (searchTerms.length > 0) {
    const orConditions = searchTerms.map(term => 
      `title.ilike.%${term}%,description.ilike.%${term}%`
    ).join(',');
    queryBuilder = queryBuilder.or(orConditions);
  }

  const { data: products, error } = await queryBuilder;

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  // If no results with search, get popular products
  if (!products || products.length === 0) {
    console.log('No results, fetching popular products');
    const { data: popularProducts } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        price,
        price_old,
        description,
        is_hit,
        is_new,
        is_sale,
        product_images(url, is_main)
      `)
      .eq('is_active', true)
      .eq('is_hit', true)
      .limit(limit);
    
    return popularProducts || [];
  }

  return products;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Processing chat request with', messages.length, 'messages');

    // First call to check if we need to use tools
    const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        tools,
        tool_choice: 'auto',
      }),
    });

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error('OpenAI API error:', initialResponse.status, errorText);
      throw new Error(`OpenAI API error: ${initialResponse.status}`);
    }

    const initialData = await initialResponse.json();
    const assistantMessage = initialData.choices[0].message;

    // Check if the model wants to call a function
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.function.name === 'search_products') {
        const args = JSON.parse(toolCall.function.arguments);
        const products = await searchProducts(supabase, args.query, args.limit || 4);
        
        console.log('Found products:', products.length);

        // Format products for the response
        const productData = products.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.price,
          price_old: p.price_old,
          image: p.product_images?.find((img: any) => img.is_main)?.url || p.product_images?.[0]?.url,
          is_hit: p.is_hit,
          is_new: p.is_new,
          is_sale: p.is_sale,
        }));

        // Make a follow-up call to generate a response with the product data
        const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages,
              assistantMessage,
              {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify({ products: productData, query: args.query })
              }
            ],
            stream: true,
          }),
        });

        if (!followUpResponse.ok) {
          throw new Error(`OpenAI API error: ${followUpResponse.status}`);
        }

        // Create a custom stream that injects product data
        const encoder = new TextEncoder();
        const productEvent = `data: ${JSON.stringify({ type: 'products', products: productData })}\n\n`;
        
        const stream = new ReadableStream({
          async start(controller) {
            // First send the products
            controller.enqueue(encoder.encode(productEvent));
            
            // Then stream the text response
            const reader = followUpResponse.body?.getReader();
            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
            }
            controller.close();
          }
        });

        return new Response(stream, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          },
        });
      }
    }

    // No tool call needed, stream regular response
    const streamResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true,
      }),
    });

    return new Response(streamResponse.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
