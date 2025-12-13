import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch products from database for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
      .from("products")
      .select("id, title, slug, description, price, is_hit, is_new, is_sale")
      .eq("is_active", true)
      .limit(50);

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug");

    const productList = products?.map(p => 
      `- ${p.title} (${p.price}₽)${p.is_hit ? " [Хит]" : ""}${p.is_new ? " [Новинка]" : ""}${p.is_sale ? " [Скидка]" : ""}: ${p.description || "Без описания"} | slug: ${p.slug}`
    ).join("\n") || "Товары не найдены";

    const categoryList = categories?.map(c => c.name).join(", ") || "Нет категорий";

    const systemPrompt = `Ты — дружелюбный AI-консультант интернет-магазина воздушных шаров FlyArt в Красноярске.

Твоя задача — помочь пользователю подобрать идеальный букет или композицию из шаров через диалог.

ПРАВИЛА:
1. Задавай вопросы по одному, не несколько сразу
2. Начни с вопроса о поводе (день рождения, свадьба, праздник и т.д.)
3. Затем уточни предпочтения по цвету, стилю, бюджету
4. После 2-3 вопросов предложи конкретные товары из каталога
5. Всегда указывай цены в рублях
6. Когда рекомендуешь товар, обязательно укажи его slug в формате [PRODUCT:slug] для создания ссылки
7. Будь кратким и дружелюбным, используй эмодзи умеренно

ДОСТУПНЫЕ КАТЕГОРИИ:
${categoryList}

ДОСТУПНЫЕ ТОВАРЫ:
${productList}

Если подходящего товара нет — честно скажи об этом и предложи связаться с менеджером по телефону +7 (923) 771-40-04.`;

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов. Попробуйте позже." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Требуется пополнение баланса AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Ошибка AI сервиса" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Product advisor error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
