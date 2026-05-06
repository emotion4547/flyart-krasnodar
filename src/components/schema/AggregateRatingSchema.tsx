import { Helmet } from 'react-helmet-async';

interface AggregateRatingSchemaProps {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

/**
 * Schema.org AggregateRating structured data for SEO
 * Displays star ratings in search results
 */
export function AggregateRatingSchema({
  ratingValue,
  reviewCount,
  bestRating = 5,
  worstRating = 1,
}: AggregateRatingSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://ко-шарик.рф/#business',
    name: 'Кошарик — Воздушные шары',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount: reviewCount,
      bestRating: bestRating,
      worstRating: worstRating,
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
