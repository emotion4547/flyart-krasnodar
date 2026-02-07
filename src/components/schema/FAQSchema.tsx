import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

/**
 * Schema.org FAQPage structured data for SEO
 * Helps display FAQ rich snippets in search results
 */
export function FAQSchema({ items }: FAQSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}

// Common FAQs for delivery page
export const deliveryFAQs: FAQItem[] = [
  {
    question: 'Как быстро осуществляется доставка воздушных шаров?',
    answer: 'Доставка осуществляется ежедневно с 09:00 до 22:00. Минимальное время доставки — от 2 часов с момента подтверждения заказа.',
  },
  {
    question: 'Сколько стоит доставка шаров по Красноярску?',
    answer: 'Стоимость доставки зависит от района: Центр города — 200 руб., Районы от центра — 300 руб., Железнодорожный район — 400 руб., Солнечный, Солонцы — 500 руб.',
  },
  {
    question: 'Какие способы оплаты вы принимаете?',
    answer: 'Мы принимаем оплату банковским переводом, по QR-коду через мобильный банк, а также наличными при получении заказа.',
  },
  {
    question: 'Можно ли забрать заказ самовывозом?',
    answer: 'Да, самовывоз возможен по адресу: г. Красноярск, ул. Александра Матросова 30ст57. Необходимо заранее договориться о времени.',
  },
  {
    question: 'Нужна ли предоплата за заказ?',
    answer: 'Да, возможна предоплата в размере от 30% до 100% от стоимости заказа в зависимости от сложности композиции.',
  },
];
