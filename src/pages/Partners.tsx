import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { useActivePartners } from "@/hooks/usePartners";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const Partners = () => {
  const { data: partners = [], isLoading } = useActivePartners();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Партнёры — бонусы для покупателей FlyArt"
        description="Оформите заказ в FlyArt и получите скидки и бонусы от наших партнёров в Красноярске."
      />
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Наши партнёры
          </h1>
          <div className="gold-line max-w-xs mb-4" />
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Оформите заказ в FlyArt и получите эксклюзивные бонусы от наших партнёров. Промокоды и условия вы получите после оформления заказа.
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-video rounded-2xl" />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">
              Информация о партнёрах скоро появится
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <article
                  key={partner.id}
                  className="group bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col"
                >
                  {/* Banner 16:9 */}
                  <div className="relative aspect-video w-full bg-muted">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-tiffany/20 to-primary/20 flex items-center justify-center">
                        <Gift className="h-12 w-12 text-tiffany" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Discount badge */}
                    {partner.discount_value && (
                      <div className="absolute top-3 right-3 bg-tiffany text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {partner.discount_value}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="text-lg font-bold text-foreground mb-2">
                      {partner.name}
                    </h2>

                    <div className="flex items-start gap-2 mb-3 bg-tiffany-light rounded-xl p-3">
                      <Gift className="h-5 w-5 text-tiffany flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        {partner.benefit_short}
                      </span>
                    </div>

                    {partner.benefit_detail && (
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {partner.benefit_detail}
                      </p>
                    )}

                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Перейти на сайт
                        </Button>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Partners;
