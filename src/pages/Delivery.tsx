import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, CreditCard, MapPin, Clock, Banknote, QrCode } from "lucide-react";

const deliveryZones = [
  { zone: "Центр города", price: "200 руб." },
  { zone: "Районы от центра", price: "300 руб." },
  { zone: "Железнодорожный район", price: "400 руб." },
  { zone: "Солнечный, Солонцы", price: "500 руб." },
];

const Delivery = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-tiffany-light via-background to-peach py-12 md:py-20">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Доставка и оплата
              </h1>
              <p className="text-lg text-muted-foreground">
                Быстрая доставка воздушных шаров по Красноярску с 09:00 до 22:00
              </p>
            </div>
          </div>
        </section>

        {/* Delivery Section */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-tiffany-light flex items-center justify-center">
                    <Truck className="h-6 w-6 text-tiffany" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Доставка</h2>
                </div>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Доставляем воздушные шары по всему Красноярску ежедневно с 09:00 до 22:00. 
                  Наши курьеры бережно доставят вашу композицию точно в указанное время.
                </p>

                <div className="bg-card rounded-2xl p-6 mb-8 shadow-soft">
                  <h3 className="font-semibold text-foreground mb-4">Стоимость доставки по зонам:</h3>
                  <div className="space-y-3">
                    {deliveryZones.map((zone, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                      >
                        <span className="text-foreground">{zone.zone}</span>
                        <span className="font-semibold text-tiffany">{zone.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-peach rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-cta mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Самовывоз</h4>
                      <p className="text-muted-foreground text-sm">
                        г. Красноярск, ул. Александра Матросова 30ст57
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        По предварительной договорённости
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-peach flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-cta" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Оплата</h2>
                </div>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Мы принимаем различные способы оплаты для вашего удобства. 
                  Возможна предоплата в размере 30-100% от стоимости заказа.
                </p>

                <div className="space-y-4">
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-tiffany-light flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-tiffany" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Банковский перевод</h4>
                        <p className="text-muted-foreground text-sm">
                          Сделайте заказ в нашем интернет-магазине или у оператора. 
                          В комментарии к платежу укажите ФИО получателя.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gold-light flex items-center justify-center flex-shrink-0">
                        <QrCode className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Оплата по QR-коду</h4>
                        <p className="text-muted-foreground text-sm">
                          Быстрая и удобная оплата через мобильное приложение вашего банка
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-peach flex items-center justify-center flex-shrink-0">
                        <Banknote className="h-5 w-5 text-cta" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Наличные</h4>
                        <p className="text-muted-foreground text-sm">
                          Оплата наличными при получении заказа курьеру или при самовывозе
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Working Hours */}
        <section className="bg-warm-cream py-12">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-tiffany" />
                <div>
                  <p className="text-sm text-muted-foreground">Время работы</p>
                  <p className="font-semibold text-foreground">Ежедневно с 09:00 до 22:00</p>
                </div>
              </div>
              <div className="hidden md:block h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-tiffany" />
                <div>
                  <p className="text-sm text-muted-foreground">Доставка</p>
                  <p className="font-semibold text-foreground">По всему Красноярску</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Delivery;
