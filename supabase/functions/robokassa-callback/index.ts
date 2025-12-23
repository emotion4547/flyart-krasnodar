import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// MD5 hash function
async function md5(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request): Promise<Response> => {
  try {
    console.log("Robokassa callback: Received notification");

    // Parse request data (can be GET or POST)
    let params: URLSearchParams;
    
    if (req.method === "GET") {
      params = new URL(req.url).searchParams;
    } else {
      const body = await req.text();
      params = new URLSearchParams(body);
    }

    const outSum = params.get("OutSum");
    const invId = params.get("InvId");
    const signatureValue = params.get("SignatureValue");
    const orderId = params.get("Shp_orderId");

    console.log(`Robokassa callback: OutSum=${outSum}, InvId=${invId}, orderId=${orderId}`);

    if (!outSum || !invId || !signatureValue || !orderId) {
      console.error("Robokassa callback: Missing required parameters");
      return new Response("Missing required parameters", { status: 400 });
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Robokassa settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "payment")
      .maybeSingle();

    if (settingsError) {
      console.error("Robokassa callback: Error fetching settings:", settingsError);
      return new Response("Internal error", { status: 500 });
    }

    const paymentSettings = settingsData?.value as {
      robokassaPassword2?: string;
    } | null;

    const password2 = paymentSettings?.robokassaPassword2;

    if (!password2) {
      console.error("Robokassa callback: Password2 not configured");
      return new Response("Configuration error", { status: 500 });
    }

    // Verify signature: OutSum:InvId:Password2:Shp_orderId
    const expectedSignature = await md5(`${outSum}:${invId}:${password2}:Shp_orderId=${orderId}`);
    
    if (signatureValue.toLowerCase() !== expectedSignature.toLowerCase()) {
      console.error("Robokassa callback: Invalid signature");
      console.error(`Expected: ${expectedSignature}, Got: ${signatureValue}`);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Robokassa callback: Signature verified successfully");

    // Update order status to paid
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "paid",
        manager_comment: `Оплачено через Робокассу. InvId: ${invId}, Сумма: ${outSum} руб.`
      })
      .eq("id", orderId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Robokassa callback: Error updating order:", updateError);
      return new Response("Database error", { status: 500 });
    }

    if (!order) {
      console.error("Robokassa callback: Order not found:", orderId);
      return new Response("Order not found", { status: 404 });
    }

    console.log(`Robokassa callback: Order ${order.order_number} marked as paid`);

    // Return OK response for Robokassa (must be exactly "OK" + InvId)
    return new Response(`OK${invId}`, { 
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    console.error("Robokassa callback: Unexpected error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
