import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { CouponSection } from "@/components/cart/CouponSection";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart, addItem } = useCart();
  const { user } = useAuth();
  const { coupons } = useUserCoupons();
  
  const [discount, setDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [giftProduct, setGiftProduct] = useState<{ id: string; title: string; image: string } | null>(null);

  // Check for available coupons notification
  useEffect(() => {
    const activeCoupons = coupons.filter(c => !c.is_used && new Date(c.expires_at) > new Date());
    if (user && activeCoupons.length > 0) {
      toast.info(`У вас есть ${activeCoupons.length} купон${activeCoupons.length > 1 ? 'а' : ''} для применения!`, {
        id: 'available-coupons',
        duration: 5000,
      });
    }
  }, [user, coupons]);

  const handleDiscountChange = (
    newDiscount: number, 
    couponCode: string | null, 
    gift?: { id: string; title: string; image: string } | null
  ) => {
    setDiscount(newDiscount);
    setAppliedCouponCode(couponCode);
    if (gift) {
      setGiftProduct(gift);
      // Add gift to cart with price 0
      addItem({
        id: gift.id,
        title: gift.title,
        price: 0,
        image: gift.image,
        slug: '',
        sku: 'GIFT',
      }, 1);
      toast.success('Подарок добавлен в корзину!');
    } else {
      setGiftProduct(null);
    }
  };

  const finalTotal = Math.max(0, totalPrice - discount);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Корзина" noindex />
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
                <Button variant="cta" size="lg">
                  Перейти в каталог
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
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
      <SEO title="Корзина" noindex />
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Корзина
          </h1>
          <div className="gold-line max-w-xs mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 flex gap-4"
                >
                  {/* Image */}
                  <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      Арт. {item.sku}
                    </p>
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="font-medium text-foreground hover:text-tiffany transition-colors line-clamp-2 mb-3">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-sm text-muted-foreground">
                            ({item.price.toLocaleString("ru-RU")} ₽ × {item.quantity})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </article>
              ))}

              {/* Clear cart */}
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить корзину
              </Button>

              {/* Coupon section */}
              <CouponSection 
                orderTotal={totalPrice} 
                onDiscountChange={handleDiscountChange} 
              />
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border/50 sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Итого
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Товары ({items.reduce((sum, i) => sum + i.quantity, 0)} шт.)
                    </span>
                    <span className="text-foreground">
                      {totalPrice.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Скидка</span>
                      <span className="text-tiffany font-medium">
                        −{discount.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="text-tiffany font-medium">Рассчитаем</span>
                  </div>
                </div>

                <div className="gold-line mb-6" />

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-lg font-semibold text-foreground">
                    К оплате
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {finalTotal.toLocaleString("ru-RU")} ₽
                  </span>
                </div>

                <Link to="/checkout" state={{ discount, appliedCouponCode }} className="block">
                  <Button variant="cta" size="lg" className="w-full">
                    Оформить заказ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с условиями обработки
                  персональных данных
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
