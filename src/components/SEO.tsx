import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}

const SITE_URL = "https://ко-шарик.рф";

const defaultMeta = {
  title: "Кошарик — Воздушные шары с доставкой в Красноярске",
  description:
    "Заказать воздушные шары с доставкой в Красноярске. Гелиевые шары, фольгированные фигуры, композиции на день рождения и праздники. Быстрая доставка!",
  keywords:
    "воздушные шары, гелиевые шары, шары с доставкой, Красноярск, день рождения, праздник, кошарик",
  image: "/og-image.jpg",
  siteName: "Кошарик",
};

const toAbsolute = (path: string) => {
  if (!path) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  noindex = false,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${defaultMeta.siteName}` : defaultMeta.title;
  const pageDescription = description || defaultMeta.description;
  const pageKeywords = keywords || defaultMeta.keywords;
  const pageImage = toAbsolute(image || defaultMeta.image);

  // Canonical: prefer explicit url, otherwise derive from current pathname
  // (avoids query strings creating duplicate canonicals).
  const pathname =
    url ||
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const canonicalUrl = toAbsolute(pathname);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
    </Helmet>
  );
}
