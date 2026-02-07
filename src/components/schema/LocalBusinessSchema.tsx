import { Helmet } from 'react-helmet-async';
import { useContactInfo, formatPhone } from '@/hooks/useContactInfo';

/**
 * Schema.org LocalBusiness structured data for SEO
 * Helps search engines understand the business information
 */
export function LocalBusinessSchema() {
  const { contactInfo } = useContactInfo();

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://flyart24.ru/#business',
    name: 'FlyArt — Воздушные шары',
    alternateName: 'ФлайАрт',
    description: 'Доставка воздушных шаров с гелием в Красноярске. Эксклюзивные композиции для любого праздника.',
    url: 'https://flyart24.ru',
    telephone: formatPhone(contactInfo.phone),
    email: contactInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Александра Матросова 30ст57',
      addressLocality: 'Красноярск',
      addressRegion: 'Красноярский край',
      postalCode: '660020',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 56.0184,
      longitude: 92.8672,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '09:00',
      closes: '22:00',
    },
    priceRange: '₽₽',
    image: 'https://flyart24.ru/og-image.jpg',
    logo: 'https://flyart24.ru/pwa-icon.png',
    sameAs: [
      `https://vk.com/${contactInfo.vk}`,
      `https://t.me/${contactInfo.telegram}`,
      `https://wa.me/${contactInfo.whatsapp}`,
    ],
    areaServed: {
      '@type': 'City',
      name: 'Красноярск',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Воздушные шары',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Гелиевые шары',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Фольгированные фигуры',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Композиции из шаров',
        },
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
