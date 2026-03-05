import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, Phone, ArrowRight, XCircle, CreditCard, Gift, ExternalLink } from "lucide-react";
import { useActivePartners } from "@/hooks/usePartners";

const OrderSuccess = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const { data: partners = [] } = useActivePartners();
  
  const isPaymentSuccess = paymentStatus === "success";
  const isPaymentFailed = paymentStatus === "failed";
  const isPaid = isPaymentSuccess;
  const activePartnersWithPromo = partners.filter(p => p.promo_code || p.website_url);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in ${
              isPaymentFailed ? 'bg-destructive/10' : 'bg-tiffany-light'
            }`}>
              {isPaymentFailed ? (
                <XCircle className="h-12 w-12 text-destructive" />
              ) : (
                <CheckCircle className="h-12 w-12 text-tiffany" />
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-up">
              {isPaymentFailed ? "Оплата не прошла" : "Заказ оформлен!"}
            </h1>
            
            <div className="gold-line max-w-xs mx-auto mb-6" />
            
            {orderNumber && (
              <p className="text-lg text-muted-foreground mb-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Номер заказа:
              </p>
            )}
            {orderNumber && (
              <p className="text-2xl font-bold text-tiffany mb-6 animate-fade-up" style={{ animationDelay: "0.15s" }}>
                {orderNumber}
              </p>
            )}

            {isPaid && (
              <div className="inline-flex items-center gap-2 bg-tiffany/10 text-tiffany px-4 py-2 rounded-full mb-6 animate-fade-up" style={{ animationDelay: "0.17s" }}>
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Оплата успешно получена</span>
              </div>
            )}
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {isPaymentFailed 
                ? "К сожалению, оплата не была завершена. Вы можете попробовать снова или выбрать другой способ оплаты."
                : "Спасибо за заказ! Мы свяжемся с вами в ближайшее время для подтверждения деталей доставки."
              }
            </p>

            <div className="bg-card rounded-2xl p-6 border border-border/50 mb-8 animate-fade-up" style={{ animationDelay: "0.25s" }}>
              <h2 className="font-semibold text-foreground mb-3">
                {isPaymentFailed ? "Что можно сделать?" : "Что дальше?"}
              </h2>
              <ul className="text-left text-muted-foreground space-y-2 text-sm">
                {isPaymentFailed ? (
                  <>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      Проверьте баланс карты и попробуйте снова
                    </li>
                    <li className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                      Свяжитесь с нами для оплаты при получении
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                      {isPaid ? "Оплата получена, заказ передан в обработку" : "Наш менеджер позвонит вам для подтверждения заказа"}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                      Мы подготовим вашу композицию с заботой
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                      Доставим шары в указанное время и место
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Partner bonuses */}
            {!isPaymentFailed && activePartnersWithPromo.length > 0 && (
              <div className="bg-card rounded-2xl border border-tiffany/20 p-6 mb-8 text-left animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-tiffany" />
                  <h2 className="font-semibold text-foreground">
                    Бонусы от наших партнёров
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Спасибо за заказ! Воспользуйтесь скидками от наших партнёров:
                </p>
                <div className="space-y-3">
                  {activePartnersWithPromo.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center gap-4 bg-warm-cream rounded-xl p-4 border border-border/50"
                    >
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-tiffany-light flex items-center justify-center flex-shrink-0">
                          <Gift className="h-5 w-5 text-tiffany" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {partner.discount_value && (
                            <span className="text-tiffany-dark font-medium">{partner.discount_value} · </span>
                          )}
                          {partner.benefit_short}
                        </p>
                        {partner.promo_code && (
                          <div className="mt-1.5 inline-flex items-center gap-1.5 bg-tiffany/10 text-tiffany-dark text-xs font-mono font-bold px-3 py-1 rounded-full">
                            Промокод: {partner.promo_code}
                          </div>
                        )}
                      </div>
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Сайт
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.35s" }}>
              <Link to="/catalog">
                <Button variant="cta" size="lg">
                  {isPaymentFailed ? "Вернуться в каталог" : "Продолжить покупки"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="tel:+79001234567">
                <Button variant="tiffanyOutline" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Позвонить нам
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
