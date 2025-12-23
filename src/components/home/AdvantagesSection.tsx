import { Truck, Smartphone, Wallet, ShieldCheck } from "lucide-react";

const advantages = [
  {
    icon: Truck,
    title: "Быстрая доставка",
    description: "Доставим шары в любую точку Красноярска от 2 часов после заказа",
    color: "bg-tiffany-light",
    iconColor: "text-tiffany-dark",
  },
  {
    icon: Smartphone,
    title: "Удобный заказ",
    description: "Оформите заказ на сайте или по телефону — всё просто и быстро",
    color: "bg-peach",
    iconColor: "text-cta",
  },
  {
    icon: Wallet,
    title: "Приятные цены",
    description: "Работаем напрямую с производителями — держим цены доступными",
    color: "bg-gold-light",
    iconColor: "text-accent-foreground",
  },
  {
    icon: ShieldCheck,
    title: "Безопасность шаров",
    description: "Используем только качественный латекс и безопасный гелий",
    color: "bg-tiffany-light",
    iconColor: "text-tiffany",
  },
];

// Конфетти частицы
const confettiParticles = [
  { className: "animate-confetti-1 bg-gold", size: "w-2 h-2", position: "top-1/3 right-1/4" },
  { className: "animate-confetti-2 bg-tiffany", size: "w-1.5 h-1.5", position: "top-1/2 right-1/3" },
  { className: "animate-confetti-3 bg-cta", size: "w-2 h-2", position: "top-2/5 right-1/5" },
  { className: "animate-confetti-4 bg-peach-dark", size: "w-1.5 h-1.5", position: "top-1/2 right-1/4" },
  { className: "animate-confetti-5 bg-gold", size: "w-1 h-1", position: "top-1/3 right-1/3" },
  { className: "animate-confetti-6 bg-tiffany-dark", size: "w-1.5 h-1.5", position: "top-2/5 right-2/5" },
];

export function AdvantagesSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Почему выбирают нас
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Мы заботимся о каждой детали, чтобы ваш праздник был идеальным
          </p>
        </div>

        {/* Advantages grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={advantage.title}
                className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-tiffany/30 transition-all duration-300 hover:shadow-card animate-fade-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Анимированные конфетти */}
                <div className="absolute inset-0 pointer-events-none">
                  {confettiParticles.map((particle, i) => (
                    <div
                      key={i}
                      className={`absolute ${particle.position} ${particle.size} ${particle.className} rounded-full opacity-70`}
                    />
                  ))}
                </div>
                
                <div className={`relative z-10 h-14 w-14 rounded-2xl ${advantage.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${advantage.iconColor}`} />
                </div>
                <h3 className="relative z-10 font-semibold text-foreground text-lg mb-2">
                  {advantage.title}
                </h3>
                <p className="relative z-10 text-muted-foreground text-sm leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
