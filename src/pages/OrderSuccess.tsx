import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Phone, ArrowRight } from "lucide-react";

const OrderSuccess = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="h-24 w-24 rounded-full bg-tiffany-light flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="h-12 w-12 text-tiffany" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-up">
              Заказ оформлен!
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
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Спасибо за заказ! Мы свяжемся с вами в ближайшее время для подтверждения деталей доставки.
            </p>

            <div className="bg-card rounded-2xl p-6 border border-border/50 mb-8 animate-fade-up" style={{ animationDelay: "0.25s" }}>
              <h2 className="font-semibold text-foreground mb-3">Что дальше?</h2>
              <ul className="text-left text-muted-foreground space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                  Наш менеджер позвонит вам для подтверждения заказа
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                  Мы подготовим вашу композицию с заботой
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-tiffany mt-0.5 flex-shrink-0" />
                  Доставим шары в указанное время и место
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/catalog">
                <Button variant="cta" size="lg">
                  Продолжить покупки
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
