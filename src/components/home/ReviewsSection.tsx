import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Анна М.",
    date: "2 дня назад",
    rating: 5,
    text: "Заказывала шары на день рождения дочки. Всё было идеально — красивая композиция, доставили вовремя, курьер очень вежливый. Рекомендую!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Дмитрий К.",
    date: "неделю назад",
    rating: 5,
    text: "Отличный сервис! Заказал коробку-сюрприз для жены — получилось очень эффектно. Она была в восторге. Цены адекватные, качество на высоте.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Елена В.",
    date: "2 недели назад",
    rating: 5,
    text: "Уже второй раз заказываю здесь шары. В первый раз была выписка из роддома, сейчас — первый день рождения. Всегда всё супер!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
];

export function ReviewsSection() {
  return (
    <section className="section-padding bg-warm-cream">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Отзывы наших клиентов
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Нам доверяют сотни семей Красноярска — читайте реальные отзывы
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <article
              key={review.id}
              className="relative p-6 rounded-2xl bg-card border border-border/50 hover:border-tiffany/30 transition-all duration-300 hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-tiffany-light" />

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-tiffany-light"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{review.name}</h4>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-gold text-gold"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {review.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
