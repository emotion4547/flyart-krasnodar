import { Button } from "@/components/ui/button";
import { Sparkles, Truck, Gift } from "lucide-react";
import { Link } from "react-router-dom";

// Import balloon images
import balloonRed from "@/assets/balloon-red.png";
import balloonTiffany from "@/assets/balloon-tiffany.png";
import balloonPink from "@/assets/balloon-pink.png";
import balloonGold from "@/assets/balloon-gold.png";

const balloons = [
  { src: balloonRed, side: 'left', delay: 0, duration: 12, left: '5%', size: 60 },
  { src: balloonTiffany, side: 'left', delay: 2, duration: 14, left: '12%', size: 50 },
  { src: balloonPink, side: 'left', delay: 4, duration: 11, left: '3%', size: 45 },
  { src: balloonGold, side: 'left', delay: 6, duration: 13, left: '8%', size: 55 },
  { src: balloonRed, side: 'right', delay: 1, duration: 13, right: '6%', size: 55 },
  { src: balloonTiffany, side: 'right', delay: 3, duration: 12, right: '10%', size: 50 },
  { src: balloonPink, side: 'right', delay: 5, duration: 14, right: '4%', size: 60 },
  { src: balloonGold, side: 'right', delay: 7, duration: 11, right: '12%', size: 45 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-tiffany-light/20 via-background to-background min-h-[600px] md:min-h-[700px]">
      {/* Floating balloons animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {balloons.map((balloon, index) => (
          <img
            key={index}
            src={balloon.src}
            alt=""
            className="absolute animate-balloon-float opacity-80"
            style={{
              width: balloon.size,
              height: 'auto',
              left: balloon.side === 'left' ? balloon.left : 'auto',
              right: balloon.side === 'right' ? balloon.right : 'auto',
              animationDelay: `${balloon.delay}s`,
              animationDuration: `${balloon.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative py-8 md:py-12">
        {/* Rounded banner */}
        <div className="relative bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl border border-border/50 px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 justify-center sm:justify-start bg-background/50 rounded-xl px-4 py-3">
                <div className="h-10 w-10 rounded-xl bg-tiffany-light flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-tiffany-dark" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">Доставка</p>
                  <p className="text-xs text-muted-foreground">от 2 часов</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-start bg-background/50 rounded-xl px-4 py-3">
                <div className="h-10 w-10 rounded-xl bg-peach flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-cta" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">Готовые наборы</p>
                  <p className="text-xs text-muted-foreground">от 990 ₽</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-start bg-background/50 rounded-xl px-4 py-3">
                <div className="h-10 w-10 rounded-xl bg-gold-light flex items-center justify-center flex-shrink-0">
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
      </div>
    </section>
  );
}
