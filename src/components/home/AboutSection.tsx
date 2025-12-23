import { Check } from "lucide-react";
import aboutBalloons from "@/assets/about-balloons.jpg";

export function AboutSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-card">
              <img
                src={aboutBalloons}
                alt="Воздушные шары FlyArt"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-tiffany-light/50 blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-peach/50 blur-2xl -z-10" />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              FlyArt — воздушные шары с душой
            </h2>
            <div className="gold-line max-w-xs mb-6" />
            
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                Мы — команда энтузиастов, влюблённых в своё дело. С 2018 года создаём праздничное 
                настроение для жителей Красноярска, превращая обычные дни в незабываемые события.
              </p>
              <p>
                Каждая наша композиция — это не просто набор шаров, а продуманная история, 
                которая дарит улыбки и восторг. Мы используем только качественные материалы 
                и следим за каждой деталью.
              </p>
            </div>

            {/* Features list */}
            <ul className="space-y-3">
              {[
                "Собственный склад и мастерская в Красноярске",
                "Более 1000 успешных заказов за последний год",
                "Индивидуальный подход к каждому клиенту",
                "Гарантия свежести и качества шаров",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-tiffany-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-tiffany-dark" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
