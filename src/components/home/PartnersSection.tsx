import { Link } from "react-router-dom";
import { useActivePartners } from "@/hooks/usePartners";
import { Gift, ArrowRight } from "lucide-react";
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {partners.slice(0, 8).map((partner) => (
            <div
              key={partner.id}
              className="bg-card rounded-2xl border border-border/50 p-4 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-tiffany-light flex items-center justify-center">
                  <Gift className="h-6 w-6 text-tiffany" />
                </div>
              )}
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {partner.name}
              </h3>
              <p className="text-xs text-tiffany-dark font-medium">
                {partner.discount_value && `${partner.discount_value} · `}
                {partner.benefit_short}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
