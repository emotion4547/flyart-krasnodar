import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Gift } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-tiffany-light/30 via-background to-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-peach/40 blur-2xl animate-float" />
        <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-tiffany-light/50 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-gold-light/40 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 rounded-full bg-peach/30 blur-xl animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container-custom relative">
        <div className="flex flex-col items-center text-center py-16 md:py-24 lg:py-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach/50 border border-peach-dark/30 mb-6 animate-fade-up">
            <Sparkles className="h-4 w-4 text-cta" />
            <span className="text-sm font-medium text-foreground">Эксклюзивные композиции</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 max-w-4xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Воздушные шары с{" "}
            <span className="text-tiffany">гелием</span>
            <br className="hidden sm:block" />
            в Красноярске
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Создаём праздничное настроение! Доставляем красивые композиции из шаров по всему городу — быстро и аккуратно.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl">
              Заказать шары
            </Button>
            <Button variant="heroSecondary" size="xl">
              Смотреть каталог
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="h-10 w-10 rounded-xl bg-tiffany-light flex items-center justify-center">
                <Truck className="h-5 w-5 text-tiffany-dark" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Доставка</p>
                <p className="text-xs text-muted-foreground">от 2 часов</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="h-10 w-10 rounded-xl bg-peach flex items-center justify-center">
                <Gift className="h-5 w-5 text-cta" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Готовые наборы</p>
                <p className="text-xs text-muted-foreground">от 990 ₽</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="h-10 w-10 rounded-xl bg-gold-light flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Индивидуальный</p>
                <p className="text-xs text-muted-foreground">дизайн</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
