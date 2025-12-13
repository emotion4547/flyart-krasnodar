import { Helmet } from "react-helmet-async";

interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string;
  sku: string;
  price: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  url?: string;
  brand?: string;
}

export function ProductSchema({
  name,
  description,
  image,
  sku,
  price,
  priceCurrency = "RUB",
  availability = "InStock",
  url,
  brand = "FlyArt",
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || `Купить ${name} с доставкой в Красноярске`,
    image: image || undefined,
    sku,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      url: url || (typeof window !== "undefined" ? window.location.href : ""),
      priceCurrency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "FlyArt",
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
