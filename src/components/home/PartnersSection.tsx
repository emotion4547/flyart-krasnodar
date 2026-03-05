import { Link } from "react-router-dom";
import { useActivePartners } from "@/hooks/usePartners";
import { Gift, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PartnersSection() {
  const { data: partners = [], isLoading } = useActivePartners();

  if (isLoading || partners.length === 0) return null;

  return (
    <section className="section-padding bg-warm-cream">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Бонусы от партнёров
            </h2>
            <div className="gold-line max-w-[200px]" />
          </div>
          <Link to="/partners">
            <Button variant="ghost" className="gap-2 text-tiffany hover:text-tiffany-dark">
              Все партнёры
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <p className="text-muted-foreground mb-6 max-w-xl">
          Оформите заказ и получите эксклюзивные скидки от наших партнёров
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {partners.slice(0, 8).map((partner) => (
            <div
              key={partner.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 hover:shadow-lg transition-all duration-300"
            >
              {/* Banner image 16:9 */}
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
                    <Gift className="h-10 w-10 text-tiffany" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Hover button */}
                {partner.website_url && (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                  >
                    <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-white transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                      На сайт
                    </span>
                  </a>
                )}

                {/* Text on banner */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-bold text-white text-base leading-tight mb-1">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    {partner.discount_value && `${partner.discount_value} · `}
                    {partner.benefit_short}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
