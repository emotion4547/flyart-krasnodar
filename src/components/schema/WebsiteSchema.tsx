import { Helmet } from 'react-helmet-async';

/**
 * Schema.org WebSite structured data for SEO
 * Enables site search in Google results and provides website metadata
 */
export function WebsiteSchema() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://flyart24.ru/#website',
    name: 'FlyArt — Воздушные шары',
    url: 'https://flyart24.ru',
    description: 'Доставка воздушных шаров с гелием в Красноярске',
    publisher: {
      '@id': 'https://flyart24.ru/#organization',
    },
    inLanguage: 'ru-RU',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://flyart24.ru/catalog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
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
