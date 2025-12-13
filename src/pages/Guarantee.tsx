import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield, AlertTriangle, Clock, MessageCircle, CheckCircle, XCircle } from "lucide-react";

const guaranteeRules = [
  {
    icon: AlertTriangle,
    title: "Температурный режим",
    description: "Шары нельзя оставлять в машине/на балконе на солнце, даже на несколько часов. Шары из латекса при нагревании лопаются в течение 1-4 часов. Если шары были на солнце, проверить наличие брака невозможно.",
    type: "warning"
  },
  {
    icon: Clock,
    title: "Срок обращения",
    description: "Гарантия на устранение обоснованного брака не дается, пока изготовители упустили как можно раньше сообщить о возникшей проблеме. Мы всегда подскажем, как лучше сохранить ваши шары. Поэтому заявки на замену шаров принимаются только в течение 3 часов после доставки.",
    type: "info"
  },
  {
    icon: MessageCircle,
    title: "Как сообщить о браке",
    description: "Вам необходимо прислать фото обнаруженного брака нашему менеджеру, который постарается максимально оперативно предложить способы решения проблемы.",
    type: "success"
  }
];

const Guarantee = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-tiffany-light via-background to-peach py-12 md:py-20">
          <div className="container-custom">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-tiffany flex items-center justify-center">
                  <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Гарантия
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Мы заботимся о качестве наших композиций и гарантируем их безопасность
              </p>
            </div>
          </div>
        </section>

        {/* Legal Info */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-8 shadow-soft mb-12">
                <p className="text-muted-foreground leading-relaxed">
                  В соответствии с законом РФ от 07.02.1992 №2300-1 (ред. 25.10.2007 г.) «О защите прав потребителей» 
                  и постановлением Правительства Российской Федерации от 19.01.1998 N 55 (В ред. 27.03.2007 г.) 
                  воздушные шары обмену и возврату не подлежат.
                </p>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Правила использования шаров
              </h2>

              <div className="space-y-6">
                {guaranteeRules.map((rule, index) => (
                  <div 
                    key={index}
                    className={`rounded-2xl p-6 ${
                      rule.type === "warning" ? "bg-peach" : 
                      rule.type === "info" ? "bg-tiffany-light" : 
                      "bg-card shadow-soft"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rule.type === "warning" ? "bg-cta/20" : 
                        rule.type === "info" ? "bg-tiffany/20" : 
                        "bg-green-100"
                      }`}>
                        <rule.icon className={`h-6 w-6 ${
                          rule.type === "warning" ? "text-cta" : 
                          rule.type === "info" ? "text-tiffany" : 
                          "text-green-600"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {rule.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Notes */}
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold text-foreground">Мы гарантируем</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      Качественные материалы для шаров
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      Бережную доставку композиций
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      Оперативное решение проблем
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      Замену при обоснованном браке
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <h3 className="font-semibold text-foreground">Гарантия не распространяется</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      На шары, оставленные на солнце
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      При механических повреждениях
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      При обращении позже 3 часов
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      При нарушении условий хранения
                    </li>
                  </ul>
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

export default Guarantee;
