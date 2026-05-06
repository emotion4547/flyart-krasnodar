import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const Contacts = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Контакты"
        description="Контакты Кошарик в Красноярске. Телефон +7 (923) 771-40-04, адрес: ул. Александра Матросова 30ст57."
        keywords="контакты Кошарик, воздушные шары Красноярск телефон"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-tiffany-light via-background to-peach py-12 md:py-20">
          <div className="container-custom">
            <Breadcrumbs />
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Контакты
              </h1>
              <p className="text-lg text-muted-foreground">
                Свяжитесь с нами любым удобным способом — мы всегда на связи!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-tiffany-light flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-tiffany" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Телефон</h3>
                      <a 
                        href="tel:+79237714004" 
                        className="text-xl font-bold text-tiffany hover:text-tiffany-dark transition-colors"
                      >
                        +7 (923) 771-40-04
                      </a>
                      <p className="text-muted-foreground text-sm mt-1">
                        Звоните, мы всегда рады помочь!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-peach flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-cta" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <a 
                        href="mailto:tatyanaportnykh@gmail.com" 
                        className="text-lg font-medium text-foreground hover:text-tiffany transition-colors"
                      >
                        tatyanaportnykh@gmail.com
                      </a>
                      <p className="text-muted-foreground text-sm mt-1">
                        Для заказов и предложений
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gold-light flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Адрес</h3>
                      <p className="text-foreground">
                        г. Красноярск, ул. Александра Матросова 30ст57
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Самовывоз по предварительной договорённости
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-tiffany-light flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-tiffany" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Время работы</h3>
                      <p className="text-foreground font-medium">
                        Ежедневно с 09:00 до 22:00
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Без выходных
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requisites */}
                <div className="bg-warm-cream rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-3">Реквизиты</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium text-foreground">ИП:</span> Портных Татьяна Сергеевна</p>
                    <p><span className="font-medium text-foreground">ИНН:</span> 245723126950</p>
                    <p><span className="font-medium text-foreground">ОГРНИП:</span> 326246800002871</p>
                    <p><span className="font-medium text-foreground">Расчётный счёт:</span> 40802 810 7 3171 0011289</p>
                    <p className="pt-2"><span className="font-medium text-foreground">Банк:</span> Красноярское отделение N 8646 ПАО Сбербанк</p>
                    <p><span className="font-medium text-foreground">БИК:</span> 040407627</p>
                    <p><span className="font-medium text-foreground">Корсчёт:</span> 30101 810 8 0000 0000627</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="cta" size="lg" className="flex-1 min-w-[200px]" asChild>
                    <a href="tel:+79237714004">
                      <Phone className="h-5 w-5 mr-2" />
                      Позвонить
                    </a>
                  </Button>
                  <Button variant="tiffanyOutline" size="lg" className="flex-1 min-w-[200px]" asChild>
                    <a href="https://wa.me/79237714004" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1 min-w-[200px]" asChild>
                    <a href="https://t.me/КошарикKRSK" target="_blank" rel="noopener noreferrer">
                      <Send className="h-5 w-5 mr-2" />
                      Telegram
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1 min-w-[200px]" asChild>
                    <a href="https://max.ru/u/f9LHodD0cOIgsBJYhwYzvgXVZQEOZWcZYTilnvjWf02P4dHFbb4aELVqSGQ" target="_blank" rel="noopener noreferrer">
                      MAX
                    </a>
                  </Button>
                </div>
              </div>

              {/* Map */}
              <div className="bg-card rounded-2xl overflow-hidden shadow-soft h-[500px] lg:h-auto">
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?ll=92.887274,55.974025&z=16&pt=92.887274,55.974025,pm2rdm"
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  title="Карта расположения Кошарик"
                  className="w-full h-full min-h-[400px]"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contacts;
