import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  email?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("YooKassa init: Starting payment initialization");

    const { orderId, orderNumber, amount, description, email }: PaymentRequest = await req.json();

    if (!orderId || !orderNumber || !amount) {
      console.error("YooKassa init: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, orderNumber, amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for reading settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get YooKassa settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "payment")
      .maybeSingle();

    if (settingsError) {
      console.error("YooKassa init: Error fetching settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment settings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paymentSettings = settingsData?.value as {
      onlinePayment?: boolean;
      yookassaShopId?: string;
      yookassaSecretKey?: string;
      yookassaTestMode?: boolean;
    } | null;

    if (!paymentSettings?.onlinePayment) {
      console.error("YooKassa init: Online payment is disabled");
      return new Response(
        JSON.stringify({ error: "Online payment is disabled" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const shopId = paymentSettings.yookassaShopId;
    const secretKey = paymentSettings.yookassaSecretKey;

    if (!shopId || !secretKey) {
      console.error("YooKassa init: YooKassa credentials not configured");
      return new Response(
        JSON.stringify({ error: "YooKassa credentials not configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the site URL from request origin or use default
    const origin = req.headers.get("origin") || "https://fashari.ru";
    const returnUrl = `${origin}/order-success/${orderNumber}`;

    // Create payment via YooKassa API
    const idempotenceKey = `${orderId}-${Date.now()}`;
    
    const paymentPayload = {
      amount: {
        value: amount.toFixed(2),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      capture: true,
      description: description || `Заказ ${orderNumber}`,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
      receipt: email ? {
        customer: {
          email: email,
        },
        items: [
          {
            description: description || `Заказ ${orderNumber}`,
            quantity: "1",
            amount: {
              value: amount.toFixed(2),
              currency: "RUB",
            },
            vat_code: 1, // НДС не облагается
            payment_mode: "full_payment",
            payment_subject: "commodity",
          },
        ],
      } : undefined,
    };

    console.log(`YooKassa init: Creating payment for order ${orderNumber}, amount: ${amount}`);

    const yookassaResponse = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        "Authorization": `Basic ${btoa(`${shopId}:${secretKey}`)}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!yookassaResponse.ok) {
      const errorText = await yookassaResponse.text();
      console.error("YooKassa init: API error:", yookassaResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment", details: errorText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paymentResult = await yookassaResponse.json();
    
    console.log(`YooKassa init: Payment created with ID ${paymentResult.id}`);

    // Update order with payment ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        manager_comment: `YooKassa Payment ID: ${paymentResult.id}`,
        status: "pending_payment"
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("YooKassa init: Error updating order:", updateError);
      // Continue anyway, payment can still work
    }

    const paymentUrl = paymentResult.confirmation?.confirmation_url;

    if (!paymentUrl) {
      console.error("YooKassa init: No confirmation URL in response");
      return new Response(
        JSON.stringify({ error: "No payment URL received" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`YooKassa init: Payment URL created successfully for order ${orderNumber}`);

    return new Response(
      JSON.stringify({ 
        paymentUrl,
        paymentId: paymentResult.id,
        status: paymentResult.status,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("YooKassa init: Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
