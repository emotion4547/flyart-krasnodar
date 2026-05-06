import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Star, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/home/ContactForm";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const Reviews = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Отзывы"
        description="Отзывы клиентов о Кошарик. Читайте мнения о качестве воздушных шаров и доставке в Красноярске."
        keywords="отзывы Кошарик, отзывы воздушные шары Красноярск"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-tiffany-light via-background to-peach py-12 md:py-20">
          <div className="container-custom">
            <Breadcrumbs />
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Отзывы
              </h1>
              <p className="text-lg text-muted-foreground">
                Мнения наших клиентов о работе Кошарик
              </p>
            </div>
          </div>
        </section>

        {/* Rating Widget */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {/* Yandex Rating Card */}
              <div className="bg-card rounded-2xl p-8 shadow-soft mb-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-foreground">F</span>
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-2">Кошарик</h2>
                    <p className="text-muted-foreground mb-4">Воздушные шары в Красноярске</p>
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-6 w-6 text-gold fill-gold" />
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <Button variant="tiffanyOutline" size="sm" asChild>
                        <a 
                          href="https://yandex.ru/maps/-/CHuBZNmh" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Оценить на Яндексе
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href="https://2gis.ru/krasnoyarsk" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Открыть в 2ГИС
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Review CTA */}
              <div className="bg-gradient-to-r from-tiffany to-tiffany-dark rounded-2xl p-8 text-center mb-12">
                <MessageSquarePlus className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-primary-foreground mb-3">
                  Оставьте нам оценку
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
                  Ваш отзыв поможет нам стать лучше и поможет другим клиентам сделать правильный выбор
                </p>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-tiffany hover:bg-white/90"
                  asChild
                >
                  <a 
                    href="https://yandex.ru/maps/-/CHuBZNmh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Оставить отзыв
                  </a>
                </Button>
              </div>

              {/* No Reviews Yet */}
              <div className="bg-warm-cream rounded-2xl p-12 text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-10 w-10 text-gold/30" />
                  ))}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Ещё нет отзывов
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Станьте первым, кто оставит отзыв о нашей работе! 
                  Мы ценим мнение каждого клиента.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
