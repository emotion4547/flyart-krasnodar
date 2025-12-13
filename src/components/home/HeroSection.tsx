import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Gift } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] md:min-h-screen flex flex-col">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-balloons.mp4" type="video/mp4" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-background/20" />
      </div>
      
      {/* Gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />

      <div className="container-custom relative z-10 py-8 md:py-12 flex-1 flex items-center w-full">
        {/* Rounded banner - more transparent to see balloons underneath */}
        <div className="relative w-full bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl shadow-xl border border-border/30 px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          {/* Decorative gradient orbs inside banner */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-tiffany-light/30 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-peach/30 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gold-light/20 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach/50 border border-peach-dark/30 mb-6 animate-fade-up">
              <Sparkles className="h-4 w-4 text-cta" />
              <span className="text-sm font-medium text-foreground">Эксклюзивные композиции</span>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-3xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Воздушные шары с{" "}
              <span className="text-tiffany">гелием</span>{" "}
              в Красноярске
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Создаём праздничное настроение! Доставляем красивые композиции из шаров по всему городу — быстро и аккуратно.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/catalog">Заказать шары</Link>
              </Button>
              <Button variant="heroSecondary" size="xl" asChild>
                <Link to="/catalog">Смотреть каталог</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-3xl animate-fade-up w-full" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-background/50 rounded-xl px-3 py-3 md:px-4">
                <div className="h-10 w-10 rounded-xl bg-tiffany-light flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-tiffany-dark" />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-medium text-foreground text-xs md:text-sm">Доставка</p>
                  <p className="text-xs text-muted-foreground">от 2 часов</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-background/50 rounded-xl px-3 py-3 md:px-4">
                <div className="h-10 w-10 rounded-xl bg-peach flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-cta" />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-medium text-foreground text-xs md:text-sm">Готовые наборы</p>
                  <p className="text-xs text-muted-foreground">от 990 ₽</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-background/50 rounded-xl px-3 py-3 md:px-4">
                <div className="h-10 w-10 rounded-xl bg-gold-light flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-medium text-foreground text-xs md:text-sm">Индивидуальный</p>
                  <p className="text-xs text-muted-foreground">дизайн</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
