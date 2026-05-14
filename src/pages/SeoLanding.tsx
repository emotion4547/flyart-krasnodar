import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface SeoLandingConfig {
  path: string;
  categorySlug: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  lead: string;
  intro: string[];
  bullets: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  ogImage?: string;
}

interface Props {
  config: SeoLandingConfig;
}

const SITE_URL = "https://ко-шарик.рф";

export default function SeoLanding({ config }: Props) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["seo-landing-products", config.categorySlug],
    queryFn: async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", config.categorySlug)
        .maybeSingle();
      if (!cat?.id) return [];
      const { data: pc } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", cat.id);
      const ids = pc?.map((p) => p.product_id) ?? [];
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select(
          "id, title, sku, price, price_old, is_hit, is_new, is_sale, slug, images"
        )
        .in("id", ids)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(12);
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        url={config.path}
        image={config.ogImage}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          <Breadcrumbs items={[]} currentPage={config.h1} />

          <header className="max-w-3xl mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {config.h1}
            </h1>
            <div className="gold-line max-w-xs mb-5" />
            <p className="text-lg text-foreground/80 mb-4">{config.lead}</p>
            {config.intro.map((p, i) => (
              <p key={i} className="text-foreground/70 mb-3">
                {p}
              </p>
            ))}
          </header>

          {/* Bullets */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {config.bullets.map((b, i) => (
              <article
                key={i}
                className="rounded-2xl bg-background p-5 shadow-sm border border-border/50"
              >
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {b.title}
                </h2>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </article>
            ))}
          </section>

          {/* Products */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Популярные товары
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((p: any) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      slug={p.slug}
                      title={p.title}
                      sku={p.sku}
                      price={p.price}
                      priceOld={p.price_old ?? undefined}
                      image={p.images?.[0] ?? "/placeholder.svg"}
                      isHit={p.is_hit}
                      isNew={p.is_new}
                      isSale={p.is_sale}
                    />
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Button asChild variant="cta" size="lg">
                    <Link to="/catalog">Смотреть весь каталог</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Товары скоро появятся.{" "}
                <Link to="/catalog" className="text-tiffany underline">
                  Перейти в каталог
                </Link>
              </p>
            )}
          </section>

          {/* FAQ */}
          <section className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Частые вопросы
            </h2>
            <Accordion type="single" collapsible className="bg-background rounded-2xl px-6 border border-border/50">
              {config.faq.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export { SITE_URL };
