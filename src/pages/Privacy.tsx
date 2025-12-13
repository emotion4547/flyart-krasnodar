import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";
import { SEO } from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Политика конфиденциальности"
        description="Политика конфиденциальности интернет-магазина FlyArt. Обработка персональных данных."
        noindex
      />
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
                  Политика конфиденциальности
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-8 md:p-12 shadow-soft prose prose-gray max-w-none">
                <p className="text-muted-foreground mb-8">
                  Настоящая Политика конфиденциальности персональных данных (далее — Политика) 
                  действует в отношении всей информации, которую интернет-магазин FlyArt может 
                  получить о Пользователе во время использования сайта.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  1. Определение терминов
                </h2>
                <p className="text-muted-foreground mb-4">
                  1.1. В настоящей Политике используются следующие термины:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li><strong>«Персональные данные»</strong> — любая информация, относящаяся к прямо или косвенно определённому физическому лицу (субъекту персональных данных).</li>
                  <li><strong>«Обработка персональных данных»</strong> — любое действие с персональными данными, совершаемое с использованием средств автоматизации или без них.</li>
                  <li><strong>«Оператор»</strong> — ИП Портных Татьяна Сергеевна, ИНН 245723126950.</li>
                  <li><strong>«Пользователь»</strong> — лицо, имеющее доступ к Сайту и использующее его.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  2. Общие положения
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>2.1. Использование Пользователем сайта означает согласие с настоящей Политикой и условиями обработки персональных данных.</li>
                  <li>2.2. В случае несогласия с условиями Политики Пользователь должен прекратить использование сайта.</li>
                  <li>2.3. Настоящая Политика применяется только к сайту FlyArt. Сайт не контролирует и не несёт ответственности за сайты третьих лиц.</li>
                  <li>2.4. Администрация сайта не проверяет достоверность персональных данных, предоставляемых Пользователем.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  3. Предмет политики конфиденциальности
                </h2>
                <p className="text-muted-foreground mb-4">
                  3.1. Настоящая Политика устанавливает обязательства Администрации по неразглашению 
                  и обеспечению защиты конфиденциальности персональных данных.
                </p>
                <p className="text-muted-foreground mb-4">
                  3.2. Персональные данные, разрешённые к обработке:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>Фамилия, имя, отчество</li>
                  <li>Контактный телефон</li>
                  <li>Адрес электронной почты (e-mail)</li>
                  <li>Адрес доставки</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  4. Цели сбора персональных данных
                </h2>
                <p className="text-muted-foreground mb-4">
                  4.1. Персональные данные Пользователя Администрация может использовать в целях:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>Идентификации Пользователя для оформления заказа</li>
                  <li>Предоставления доступа к персонализированным ресурсам сайта</li>
                  <li>Установления обратной связи с Пользователем</li>
                  <li>Обработки и получения платежей</li>
                  <li>Доставки товаров</li>
                  <li>Предоставления информации о товарах и акциях</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  5. Способы и сроки обработки данных
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>5.1. Обработка персональных данных осуществляется без ограничения срока любым законным способом.</li>
                  <li>5.2. Пользователь соглашается с тем, что Администрация вправе передавать персональные данные третьим лицам (курьерским службам, почтовым операторам) исключительно для выполнения заказа.</li>
                  <li>5.3. Персональные данные Пользователя могут быть переданы уполномоченным органам государственной власти РФ только по основаниям и в порядке, установленным законодательством.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  6. Обязательства сторон
                </h2>
                <p className="text-muted-foreground mb-4">
                  6.1. Пользователь обязан:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Предоставить актуальную информацию о персональных данных</li>
                  <li>Обновлять данные в случае их изменения</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  6.2. Администрация обязана:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>Использовать полученную информацию исключительно для целей, указанных в настоящей Политике</li>
                  <li>Обеспечить хранение конфиденциальной информации в тайне</li>
                  <li>Принимать меры предосторожности для защиты персональных данных</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  7. Контактная информация
                </h2>
                <div className="bg-warm-cream rounded-xl p-6">
                  <p className="text-foreground mb-2"><strong>ИП Портных Татьяна Сергеевна</strong></p>
                  <p className="text-muted-foreground mb-1">ИНН: 245723126950</p>
                  <p className="text-muted-foreground mb-1">Телефон: +7 (923) 771-40-04</p>
                  <p className="text-muted-foreground">Email: tatyanaportnykh@gmail.com</p>
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

export default Privacy;
