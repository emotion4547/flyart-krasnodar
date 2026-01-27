import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("YooKassa callback: Received notification");

    // Parse notification body
    const notification = await req.json();
    
    console.log("YooKassa callback: Event type:", notification.event);
    console.log("YooKassa callback: Payment object:", JSON.stringify(notification.object));

    const payment = notification.object;
    
    if (!payment || !payment.id) {
      console.error("YooKassa callback: Missing payment object");
      return new Response("Missing payment object", { status: 400 });
    }

    const paymentId = payment.id;
    const paymentStatus = payment.status;
    const orderId = payment.metadata?.order_id;
    const orderNumber = payment.metadata?.order_number;
    const amount = payment.amount?.value;

    console.log(`YooKassa callback: Payment ${paymentId}, status: ${paymentStatus}, order: ${orderId}`);

    if (!orderId) {
      console.error("YooKassa callback: Missing order_id in metadata");
      return new Response("Missing order_id in metadata", { status: 400 });
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine order status based on payment status
    let newOrderStatus: string;
    let managerComment: string;

    switch (paymentStatus) {
      case "succeeded":
        newOrderStatus = "paid";
        managerComment = `Оплачено через ЮKassa. Payment ID: ${paymentId}, Сумма: ${amount} руб.`;
        break;
      case "canceled":
        newOrderStatus = "payment_failed";
        managerComment = `Оплата отменена. Payment ID: ${paymentId}. Причина: ${payment.cancellation_details?.reason || "неизвестна"}`;
        break;
      case "waiting_for_capture":
        // For two-stage payments, we'd capture here. For one-stage (capture: true), this shouldn't happen
        newOrderStatus = "pending_payment";
        managerComment = `Ожидает подтверждения. Payment ID: ${paymentId}`;
        break;
      case "pending":
        // Still processing
        newOrderStatus = "pending_payment";
        managerComment = `Платёж обрабатывается. Payment ID: ${paymentId}`;
        break;
      default:
        console.log(`YooKassa callback: Unhandled status ${paymentStatus}`);
        return new Response("OK", { status: 200 });
    }

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: newOrderStatus,
        manager_comment: managerComment,
      })
      .eq("id", orderId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("YooKassa callback: Error updating order:", updateError);
      return new Response("Database error", { status: 500 });
    }

    if (!order) {
      console.error("YooKassa callback: Order not found:", orderId);
      return new Response("Order not found", { status: 404 });
    }

    console.log(`YooKassa callback: Order ${order.order_number} updated to status: ${newOrderStatus}`);

    // Send Telegram notification for successful payment
    if (paymentStatus === "succeeded") {
      try {
        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
        const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
        
        if (botToken && chatId) {
          const message = `💳 <b>Оплата получена!</b>

📦 Заказ: <b>${order.order_number}</b>
🆔 YooKassa ID: <code>${paymentId}</code>
💰 Сумма: <b>${amount} ₽</b>
👤 Клиент: ${order.customer_name}
📱 Телефон: ${order.customer_phone}
${order.customer_email ? `📧 Email: ${order.customer_email}` : ""}

✅ Статус YooKassa: <b>${paymentStatus}</b>`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
            }),
          });
          console.log("Telegram notification sent for payment");
        }
      } catch (tgError) {
        console.error("Failed to send Telegram notification:", tgError);
        // Don't fail the webhook if Telegram fails
      }
    }

    // Return OK response for YooKassa
    return new Response("OK", { 
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    console.error("YooKassa callback: Unexpected error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
