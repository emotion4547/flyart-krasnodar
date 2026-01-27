import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Home, ShoppingBag, Truck, Shield, Star, MapPin, FileText, ScrollText } from "lucide-react";

const sitemapData = [
  {
    title: "Основные страницы",
    links: [
      { name: "Главная", href: "/", icon: Home },
      { name: "Каталог", href: "/catalog", icon: ShoppingBag },
      { name: "Доставка и оплата", href: "/delivery", icon: Truck },
      { name: "Гарантия", href: "/guarantee", icon: Shield },
      { name: "Отзывы", href: "/reviews", icon: Star },
      { name: "Контакты", href: "/contacts", icon: MapPin },
    ],
  },
  {
    title: "Правовая информация",
    links: [
      { name: "Политика конфиденциальности", href: "/privacy", icon: FileText },
      { name: "Публичная оферта", href: "/offer", icon: ScrollText },
    ],
  },
];

const Sitemap = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Карта сайта"
        description="Карта сайта FlyArt — все страницы магазина воздушных шаров в Красноярске"
        keywords="карта сайта, FlyArt, воздушные шары"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-tiffany-light via-background to-peach py-12 md:py-20">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Карта сайта
              </h1>
              <p className="text-lg text-muted-foreground">
                Навигация по всем страницам нашего сайта
              </p>
            </div>
          </div>
        </section>

        {/* Sitemap Content */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              {sitemapData.map((section) => (
                <div key={section.title} className="bg-card rounded-2xl p-6 shadow-soft">
                  <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-3">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="flex items-center gap-3 text-foreground hover:text-tiffany transition-colors py-2"
                          >
                            <Icon className="h-5 w-5 text-tiffany" />
                            <span>{link.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;
