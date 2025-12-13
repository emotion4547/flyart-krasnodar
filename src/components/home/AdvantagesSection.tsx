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
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-tiffany/30 transition-all duration-300 hover:shadow-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-14 w-14 rounded-2xl ${advantage.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${advantage.iconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {advantage.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
