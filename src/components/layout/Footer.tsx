import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Heart } from "lucide-react";
import { useFooterCategories } from "@/hooks/useCategories";
import { useContactInfo, formatPhone, getRawPhone } from "@/hooks/useContactInfo";

const footerLinks = {
  info: [
    { name: "Доставка и оплата", href: "/delivery" },
    { name: "Гарантия", href: "/guarantee" },
    { name: "Отзывы", href: "/reviews" },
    { name: "Контакты", href: "/contacts" },
  ],
  legal: [
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Публичная оферта", href: "/offer" },
    { name: "Карта сайта", href: "/sitemap" },
  ],
};

export function Footer() {
  const { data: categories = [] } = useFooterCategories();
  const { contactInfo } = useContactInfo();

  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Main footer */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-primary-foreground tracking-tight">FlyArt</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-6 leading-relaxed">
              Доставка воздушных шаров с гелием в Красноярске. Эксклюзивные композиции для любого праздника.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href={`tel:${getRawPhone(contactInfo.phone)}`}
                className="flex items-center gap-2 text-primary-foreground hover:text-tiffany transition-colors"
              >
                <Phone className="h-4 w-4 text-tiffany" />
                {formatPhone(contactInfo.phone)}
              </a>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Clock className="h-4 w-4 text-gold" />
                {contactInfo.workingHours}
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <MapPin className="h-4 w-4 text-gold" />
                г. Красноярск
              </div>
            </div>
          </div>

          {/* Catalog links - Dynamic from DB */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">
              Каталог
            </h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/catalog/${category.slug}`}
                    className="text-primary-foreground/70 hover:text-tiffany transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">
              Информация
            </h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-tiffany transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">
              Документы
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-tiffany transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2024 FlyArt. Все права защищены.</p>
            <p className="flex items-center gap-1">
              Сделано с <Heart className="h-4 w-4 text-cta fill-cta" /> в Красноярске
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
