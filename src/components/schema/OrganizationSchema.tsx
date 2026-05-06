import { Helmet } from 'react-helmet-async';
import { useContactInfo, formatPhone } from '@/hooks/useContactInfo';

/**
 * Schema.org Organization structured data for SEO
 * Provides general organization information for search engines
 */
export function OrganizationSchema() {
  const { contactInfo } = useContactInfo();

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://ко-шарик.рф/#organization',
    name: 'Кошарик',
    legalName: 'ИП Кошарик',
    url: 'https://ко-шарик.рф',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ко-шарик.рф/pwa-icon.png',
      width: 512,
      height: 512,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: formatPhone(contactInfo.phone),
      contactType: 'customer service',
      availableLanguage: 'Russian',
      areaServed: 'RU',
    },
    sameAs: [
      `https://vk.com/${contactInfo.vk}`,
      `https://t.me/${contactInfo.telegram}`,
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
