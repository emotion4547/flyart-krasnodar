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

// MD5 hash function
async function md5(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Robokassa init: Starting payment initialization");

    const { orderId, orderNumber, amount, description, email }: PaymentRequest = await req.json();

    if (!orderId || !orderNumber || !amount) {
      console.error("Robokassa init: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, orderNumber, amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for reading settings
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
      console.error("Robokassa init: Error fetching settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment settings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paymentSettings = settingsData?.value as {
      onlinePayment?: boolean;
      robokassaMerchantLogin?: string;
      robokassaPassword1?: string;
      robokassaTestMode?: boolean;
    } | null;

    if (!paymentSettings?.onlinePayment) {
      console.error("Robokassa init: Online payment is disabled");
      return new Response(
        JSON.stringify({ error: "Online payment is disabled" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const merchantLogin = paymentSettings.robokassaMerchantLogin;
    const password1 = paymentSettings.robokassaPassword1;
    const isTestMode = paymentSettings.robokassaTestMode ?? true;

    if (!merchantLogin || !password1) {
      console.error("Robokassa init: Robokassa credentials not configured");
      return new Response(
        JSON.stringify({ error: "Robokassa credentials not configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format amount (Robokassa requires amount with 2 decimal places)
    const formattedAmount = amount.toFixed(2);

    // Use order number as invoice ID (unique identifier)
    // Robokassa requires InvId to be a number, so we'll extract numbers from order number
    // or use a hash. For simplicity, we'll store the order_number in Shp parameter
    const invId = Date.now() % 2147483647; // Use timestamp as invoice ID (within int32 range)

    // Create signature: MerchantLogin:OutSum:InvId:Password1
    const signatureString = `${merchantLogin}:${formattedAmount}:${invId}:${password1}:Shp_orderId=${orderId}`;
    const signature = await md5(signatureString);

    console.log(`Robokassa init: Creating payment URL for order ${orderNumber}, amount: ${formattedAmount}`);

    // Build Robokassa URL
    const baseUrl = isTestMode 
      ? "https://auth.robokassa.ru/Merchant/Index.aspx"
      : "https://auth.robokassa.ru/Merchant/Index.aspx";

    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: formattedAmount,
      InvId: invId.toString(),
      Description: description || `Заказ ${orderNumber}`,
      SignatureValue: signature,
      IsTest: isTestMode ? "1" : "0",
      Shp_orderId: orderId,
    });

    // Add email if provided
    if (email) {
      params.append("Email", email);
    }

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    // Update order with invoice ID for later verification
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        manager_comment: `Robokassa InvId: ${invId}`,
        status: "pending_payment"
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Robokassa init: Error updating order:", updateError);
      // Continue anyway, payment can still work
    }

    console.log(`Robokassa init: Payment URL created successfully for order ${orderNumber}`);

    return new Response(
      JSON.stringify({ 
        paymentUrl,
        invId,
        isTestMode
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Robokassa init: Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
