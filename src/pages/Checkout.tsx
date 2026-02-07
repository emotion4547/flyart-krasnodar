import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Check, Loader2, CreditCard, Banknote, Globe, MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";

interface PaymentSettings {
  cardPayment: boolean;
  cashPayment: boolean;
  onlinePayment: boolean;
  yookassaShopId: string;
  yookassaSecretKey: string;
  yookassaTestMode: boolean;
}

const defaultPayment: PaymentSettings = {
  cardPayment: true,
  cashPayment: true,
  onlinePayment: false,
  yookassaShopId: '',
  yookassaSecretKey: '',
  yookassaTestMode: true,
};

// Base schema - email is optional for offline payments
const baseCheckoutSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(100, "Максимум 100 символов"),
  phone: z.string().trim().min(10, "Введите корректный номер телефона").max(20),
  email: z.string().trim().email("Введите корректный email").optional().or(z.literal("")),
  address: z.string().trim().min(5, "Введите адрес доставки").max(500),
  comment: z.string().max(1000).optional(),
});

// Schema for online payment - email is required for receipt (54-ФЗ)
const onlinePaymentCheckoutSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(100, "Максимум 100 символов"),
  phone: z.string().trim().min(10, "Введите корректный номер телефона").max(20),
  email: z.string().trim().min(1, "Email обязателен для онлайн-оплаты").email("Введите корректный email"),
  address: z.string().trim().min(5, "Введите адрес доставки").max(500),
  comment: z.string().max(1000).optional(),
});

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addresses, isLoading: addressesLoading } = useUserAddresses();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // Get discount from cart page
  const discount = (location.state as { discount?: number })?.discount || 0;
  const appliedCouponCode = (location.state as { appliedCouponCode?: string })?.appliedCouponCode || null;
  const appliedUserCouponId = (location.state as { appliedUserCouponId?: string })?.appliedUserCouponId || null;
  const finalTotal = Math.max(0, totalPrice - discount);

  const { data: paymentSettings, isLoading: paymentLoading } = useSettings<PaymentSettings>('payment', defaultPayment);

  // Check if online payment is fully configured
  const isOnlinePaymentConfigured = paymentSettings.onlinePayment && 
    paymentSettings.yookassaShopId && 
    paymentSettings.yookassaSecretKey;

  // Get available payment methods
  const availablePaymentMethods = [];
  if (paymentSettings.cardPayment) {
    availablePaymentMethods.push({ id: 'card', label: 'Картой при получении', icon: CreditCard });
  }
  if (paymentSettings.cashPayment) {
    availablePaymentMethods.push({ id: 'cash', label: 'Наличными при получении', icon: Banknote });
  }
  if (isOnlinePaymentConfigured) {
    availablePaymentMethods.push({ id: 'online', label: 'Оплатить онлайн', icon: Globe });
  }

  // Set default payment method if current is not available
  const effectivePaymentMethod = availablePaymentMethods.find(m => m.id === paymentMethod) 
    ? paymentMethod 
    : availablePaymentMethods[0]?.id || 'card';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      comment: formData.get("comment") as string,
    };

    // Choose schema based on payment method - online requires email for receipt
    const checkoutSchema = effectivePaymentMethod === 'online' 
      ? onlinePaymentCheckoutSchema 
      : baseCheckoutSchema;

    // Validate
    const result = checkoutSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // For online payment - validate with YooKassa FIRST before creating order
      if (effectivePaymentMethod === 'online') {
        // Create order first (needed for YooKassa metadata)
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            customer_name: data.name,
            customer_phone: data.phone,
            customer_email: data.email || null,
            delivery_address: data.address,
            comment: data.comment || null,
            subtotal: totalPrice,
            total: finalTotal,
            order_number: "", // Will be generated by trigger
            status: 'pending_payment',
            payment_method: effectivePaymentMethod,
          })
          .select()
          .maybeSingle();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          product_title: item.title,
          product_sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Mark personal coupon as used (from wheel of fortune) - for online payments, mark early
        // If payment fails, the order gets deleted and user can get a new coupon
        if (appliedUserCouponId) {
          try {
            await supabase
              .from('user_coupons')
              .update({
                is_used: true,
                used_at: new Date().toISOString(),
                order_id: order.id,
              })
              .eq('id', appliedUserCouponId);
          } catch (couponErr) {
            console.error('Error marking coupon as used:', couponErr);
          }
        }

        // Call YooKassa init edge function
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('yookassa-init', {
          body: {
            orderId: order.id,
            orderNumber: order.order_number,
            amount: finalTotal,
            description: `Заказ ${order.order_number} - FlyArt`,
            email: data.email || undefined,
          },
        });

        if (paymentError || !paymentData?.paymentUrl) {
          console.error("Payment init error:", paymentError || paymentData);
          
          // Delete the order since payment failed to initialize
          await supabase.from("order_items").delete().eq("order_id", order.id);
          await supabase.from("orders").delete().eq("id", order.id);
          
          // Restore the coupon if payment failed
          if (appliedUserCouponId) {
            try {
              await supabase
                .from('user_coupons')
                .update({
                  is_used: false,
                  used_at: null,
                  order_id: null,
                })
                .eq('id', appliedUserCouponId);
            } catch (couponErr) {
              console.error('Error restoring coupon:', couponErr);
            }
          }
          
          toast({
            title: "Ошибка оплаты",
            description: "Не удалось инициализировать оплату. Попробуйте позже или выберите другой способ оплаты.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // NOTE: For online payments, Telegram notification is sent from yookassa-callback
        // only AFTER successful payment confirmation, not here at checkout
        // Clear cart and redirect to YooKassa
        clearCart();
        window.location.href = paymentData.paymentUrl;
        return;
      }

      // For offline payments - create order normally
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: data.name,
          customer_phone: data.phone,
          customer_email: data.email || null,
          delivery_address: data.address,
          comment: data.comment || null,
          subtotal: totalPrice,
          total: finalTotal,
          order_number: "", // Will be generated by trigger
          status: 'new',
          payment_method: effectivePaymentMethod,
        })
        .select()
        .maybeSingle();


      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_title: item.title,
        product_sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Mark personal coupon as used (from wheel of fortune)
      if (appliedUserCouponId) {
        try {
          await supabase
            .from('user_coupons')
            .update({
              is_used: true,
              used_at: new Date().toISOString(),
              order_id: order.id,
            })
            .eq('id', appliedUserCouponId);
        } catch (couponErr) {
          console.error('Error marking coupon as used:', couponErr);
        }
      }

      // Send Telegram notification for offline payments
      try {
        await supabase.functions.invoke('send-telegram', {
          body: {
            message: `🛒 <b>Новый заказ!</b>

📦 Заказ: <b>${order.order_number}</b>
💰 Сумма: <b>${finalTotal.toLocaleString('ru-RU')} ₽</b>${discount > 0 ? ` (скидка ${discount.toLocaleString('ru-RU')} ₽)` : ''}
👤 Клиент: ${data.name}
📱 Телефон: ${data.phone}
${data.email ? `📧 Email: ${data.email}` : ""}
📍 Адрес: ${data.address}
${appliedCouponCode ? `🎟 Промокод: ${appliedCouponCode}` : ""}
${data.comment ? `💬 Комментарий: ${data.comment}` : ""}

💳 Оплата: ${effectivePaymentMethod === 'card' ? 'Картой при получении' : 'Наличными'}`,
          },
        });
      } catch (tgError) {
        console.error("Telegram notification error:", tgError);
      }

      // Success for offline payment
      clearCart();
      toast({
        title: "Заказ оформлен!",
        description: `Номер заказа: ${order.order_number}`,
      });
      navigate(`/order-success/${order.order_number}`);
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 section-padding bg-warm-cream">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="h-24 w-24 rounded-full bg-tiffany-light flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-tiffany" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Корзина пуста
              </h1>
              <p className="text-muted-foreground mb-8">
                Добавьте товары из каталога, чтобы оформить заказ
              </p>
              <Link to="/catalog">
                <Button variant="cta" size="lg">Перейти в каталог</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          {/* Back link */}
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-tiffany transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться в корзину
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Оформление заказа
          </h1>
          <div className="gold-line max-w-xs mb-8" />

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border/50">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Контактные данные
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ваше имя *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Как к вам обращаться?"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+7 (___) ___-__-__"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">
                        Email {effectivePaymentMethod === 'online' ? '*' : '(необязательно)'}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                      {effectivePaymentMethod === 'online' && !errors.email && (
                        <p className="text-xs text-muted-foreground">Для отправки электронного чека</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border/50">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Доставка
                  </h2>
                  <div className="space-y-4">
                    {/* Saved addresses dropdown */}
                    {user && !addressesLoading && addresses.length > 0 && (
                      <div className="space-y-2">
                        <Label>Сохранённые адреса</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-between text-left font-normal"
                            >
                              <span className="flex items-center gap-2 truncate">
                                <MapPin className="h-4 w-4 shrink-0 text-tiffany" />
                                {selectedAddress ? (
                                  <span className="truncate">
                                    {addresses.find(a => a.id === selectedAddress)?.title || 'Выбранный адрес'}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Выбрать из сохранённых</span>
                                )}
                              </span>
                              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            {addresses.map((addr) => {
                              const fullAddress = `${addr.city}, ${addr.street}, д. ${addr.house}${addr.apartment ? `, кв. ${addr.apartment}` : ''}`;
                              return (
                                <DropdownMenuItem
                                  key={addr.id}
                                  onClick={() => {
                                    setSelectedAddress(addr.id);
                                    // Fill the textarea with the formatted address
                                    const textarea = document.getElementById('address') as HTMLTextAreaElement;
                                    if (textarea) {
                                      let addressText = `${addr.city}, ${addr.street}, д. ${addr.house}`;
                                      if (addr.apartment) addressText += `, кв. ${addr.apartment}`;
                                      if (addr.entrance) addressText += `, подъезд ${addr.entrance}`;
                                      if (addr.floor) addressText += `, этаж ${addr.floor}`;
                                      if (addr.intercom) addressText += `, домофон ${addr.intercom}`;
                                      textarea.value = addressText;
                                    }
                                  }}
                                  className="flex flex-col items-start gap-1 cursor-pointer"
                                >
                                  <span className="font-medium flex items-center gap-2">
                                    {addr.title}
                                    {addr.is_default && (
                                      <span className="text-xs bg-tiffany-light text-tiffany px-1.5 py-0.5 rounded">
                                        По умолчанию
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-sm text-muted-foreground">{fullAddress}</span>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес доставки *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Улица, дом, квартира/офис"
                        rows={2}
                        className={errors.address ? "border-destructive" : ""}
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive">{errors.address}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Комментарий к заказу</Label>
                      <Textarea
                        id="comment"
                        name="comment"
                        placeholder="Пожелания по доставке, дополнительная информация..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {!paymentLoading && availablePaymentMethods.length > 1 && (
                  <div className="bg-card rounded-2xl p-6 border border-border/50">
                    <h2 className="text-xl font-bold text-foreground mb-6">
                      Способ оплаты
                    </h2>
                    <RadioGroup
                      value={effectivePaymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-3"
                    >
                      {availablePaymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <label
                            key={method.id}
                            htmlFor={`payment-${method.id}`}
                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              effectivePaymentMethod === method.id
                                ? 'border-tiffany bg-tiffany-light/30'
                                : 'border-border hover:border-tiffany/50'
                            }`}
                          >
                            <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                            <Icon className={`h-5 w-5 ${effectivePaymentMethod === method.id ? 'text-tiffany' : 'text-muted-foreground'}`} />
                            <span className="font-medium">{method.label}</span>
                            {method.id === 'online' && (
                              <span className="ml-auto text-xs text-tiffany font-medium px-2 py-1 bg-tiffany-light rounded-full">
                                Быстро и удобно
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 border border-border/50 sticky top-24">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Ваш заказ
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} шт. × {item.price.toLocaleString("ru-RU")} ₽
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="gold-line mb-6" />

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Товары</span>
                      <span className="text-foreground">
                        {totalPrice.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Скидка {appliedCouponCode && `(${appliedCouponCode})`}</span>
                        <span className="text-tiffany font-medium">
                          −{discount.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Доставка</span>
                      <span className="text-tiffany font-medium">Бесплатно</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-lg font-semibold text-foreground">Итого</span>
                    <span className="text-2xl font-bold text-foreground">
                      {finalTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Оформляем...
                      </>
                    ) : effectivePaymentMethod === 'online' ? (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Перейти к оплате
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Оформить заказ
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Нажимая кнопку, вы соглашаетесь с условиями обработки
                    персональных данных
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
