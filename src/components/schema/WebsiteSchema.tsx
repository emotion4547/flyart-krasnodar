import { Helmet } from 'react-helmet-async';

/**
 * Schema.org WebSite structured data for SEO
 * Enables site search in Google results and provides website metadata
 */
export function WebsiteSchema() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://ко-шарик.рф/#website',
    name: 'Кошарик — Воздушные шары',
    url: 'https://ко-шарик.рф',
    description: 'Доставка воздушных шаров с гелием в Красноярске',
    publisher: {
      '@id': 'https://ко-шарик.рф/#organization',
    },
    inLanguage: 'ru-RU',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ко-шарик.рф/catalog?search={search_term_string}',
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
