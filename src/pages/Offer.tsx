import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const Offer = () => {
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
                  <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Публичная оферта
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
                  Настоящий документ является официальным предложением (публичной офертой) 
                  ИП Портных Татьяна Сергеевна (далее — «Продавец») и содержит все существенные 
                  условия договора розничной купли-продажи товаров дистанционным способом.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  1. Общие положения
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>1.1. Настоящая оферта является официальным предложением Продавца заключить договор купли-продажи товаров.</li>
                  <li>1.2. Заказ Покупателем товаров означает согласие с условиями настоящей оферты (акцепт).</li>
                  <li>1.3. Оферта вступает в силу с момента размещения на сайте flyart24.ru и действует до момента её отзыва Продавцом.</li>
                  <li>1.4. Продавец оставляет за собой право вносить изменения в условия оферты без предварительного уведомления.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  2. Предмет договора
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>2.1. Продавец обязуется передать в собственность Покупателю товар (воздушные шары и композиции из них), а Покупатель обязуется оплатить и принять товар.</li>
                  <li>2.2. Наименование, количество, ассортимент и цена товара определяются на основании информации, предоставленной Покупателем при оформлении заказа.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  3. Порядок оформления заказа
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>3.1. Заказ может быть оформлен через сайт, по телефону или через мессенджеры.</li>
                  <li>3.2. При оформлении заказа Покупатель указывает: ФИО, контактный телефон, адрес доставки, дату и время доставки, состав заказа.</li>
                  <li>3.3. После оформления заказа Покупатель получает подтверждение с деталями заказа.</li>
                  <li>3.4. Продавец оставляет за собой право отменить заказ в случае отсутствия товара или невозможности связаться с Покупателем.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  4. Цена и оплата
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>4.1. Цены на товары указаны на сайте в рублях РФ и включают все налоги.</li>
                  <li>4.2. Стоимость доставки не включена в цену товара и оплачивается отдельно.</li>
                  <li>4.3. Оплата производится банковским переводом, по QR-коду или наличными при получении.</li>
                  <li>4.4. Продавец вправе требовать предоплату в размере от 30% до 100% от стоимости заказа.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  5. Доставка
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>5.1. Доставка осуществляется по адресу, указанному Покупателем при оформлении заказа.</li>
                  <li>5.2. Стоимость доставки зависит от района доставки и указывается при оформлении заказа.</li>
                  <li>5.3. Доставка осуществляется ежедневно с 09:00 до 22:00.</li>
                  <li>5.4. В случае отсутствия Покупателя по указанному адресу в согласованное время, повторная доставка оплачивается дополнительно.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  6. Гарантии и возврат
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>6.1. В соответствии с законодательством РФ воздушные шары обмену и возврату не подлежат.</li>
                  <li>6.2. Претензии по качеству принимаются в течение 3 часов с момента доставки.</li>
                  <li>6.3. Для рассмотрения претензии необходимо предоставить фото брака.</li>
                  <li>6.4. Гарантия не распространяется на повреждения, возникшие по вине Покупателя (перегрев, механические повреждения и т.д.).</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  7. Ответственность сторон
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>7.1. Продавец несёт ответственность за качество товара в момент передачи Покупателю.</li>
                  <li>7.2. Продавец не несёт ответственности за ненадлежащее использование товаров Покупателем.</li>
                  <li>7.3. Стороны освобождаются от ответственности в случае форс-мажорных обстоятельств.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  8. Конфиденциальность
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li>8.1. Продавец обязуется не разглашать персональные данные Покупателя третьим лицам, за исключением случаев, предусмотренных законодательством.</li>
                  <li>8.2. Обработка персональных данных осуществляется в соответствии с Политикой конфиденциальности.</li>
                </ul>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4">
                  9. Реквизиты Продавца
                </h2>
                <div className="bg-warm-cream rounded-xl p-6">
                  <p className="text-foreground mb-2"><strong>ИП Портных Татьяна Сергеевна</strong></p>
                  <p className="text-muted-foreground mb-1">ИНН: 245723126950</p>
                  <p className="text-muted-foreground mb-1">Адрес: г. Красноярск, ул. Александра Матросова 30ст57</p>
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

export default Offer;
