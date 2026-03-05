import { useActivePartners } from "@/hooks/usePartners";
import { Gift } from "lucide-react";
import { Link } from "react-router-dom";

export function PartnerBenefits() {
  const { data: partners = [] } = useActivePartners();

  if (partners.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-tiffany-light to-gold-light rounded-2xl p-5 border border-tiffany/20">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-5 w-5 text-tiffany" />
        <h3 className="font-semibold text-foreground text-sm">
          Бонусы от партнёров при заказе
        </h3>
      </div>
      <div className="space-y-2 mb-3">
        {partners.slice(0, 3).map((p) => (
          <div key={p.id} className="flex items-center gap-3 bg-card/80 rounded-xl px-3 py-2">
            {p.logo_url ? (
              <img src={p.logo_url} alt={p.name} className="h-8 w-8 object-contain flex-shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-tiffany-light flex items-center justify-center flex-shrink-0">
                <Gift className="h-4 w-4 text-tiffany" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {p.discount_value && <span className="text-tiffany-dark font-medium">{p.discount_value} </span>}
                {p.benefit_short}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/partners" className="text-xs text-tiffany hover:text-tiffany-dark font-medium">
        Все партнёры →
      </Link>
    </div>
  );
}
