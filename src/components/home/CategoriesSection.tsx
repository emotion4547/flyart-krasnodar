import { Link } from "react-router-dom";
import { Baby, User, Heart, Crown, Stethoscope, HelpCircle, Package, Sparkles } from "lucide-react";

const categories = [
  {
    name: "Для девочки",
    slug: "girl",
    icon: Baby,
    color: "from-pink-200 to-peach",
    iconColor: "text-pink-500",
  },
  {
    name: "Для мальчика",
    slug: "boy",
    icon: Baby,
    color: "from-blue-200 to-tiffany-light",
    iconColor: "text-blue-500",
  },
  {
    name: "Для девушки",
    slug: "woman",
    icon: Heart,
    color: "from-peach to-pink-100",
    iconColor: "text-cta",
  },
  {
    name: "Для мужчины",
    slug: "man",
    icon: Crown,
    color: "from-slate-200 to-tiffany-light",
    iconColor: "text-tiffany-dark",
  },
  {
    name: "Выписка",
    slug: "discharge",
    icon: Stethoscope,
    color: "from-tiffany-light to-blue-100",
    iconColor: "text-tiffany",
  },
  {
    name: "Гендер пати",
    slug: "gender-party",
    icon: HelpCircle,
    color: "from-pink-100 via-purple-100 to-blue-100",
    iconColor: "text-purple-500",
  },
  {
    name: "Коробки",
    slug: "boxes",
    icon: Package,
    color: "from-gold-light to-peach",
    iconColor: "text-accent-foreground",
  },
  {
    name: "Под потолок",
    slug: "ceiling",
    icon: Sparkles,
    color: "from-tiffany-light to-gold-light",
    iconColor: "text-tiffany-dark",
  },
];

export function CategoriesSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Популярные разделы
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Выберите категорию шаров для любого праздника и повода
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                to={`/catalog/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} transition-transform duration-300 group-hover:scale-105`} />
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center mb-4 shadow-soft group-hover:shadow-card transition-shadow">
                    <Icon className={`h-7 w-7 md:h-8 md:w-8 ${category.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    {category.name}
                  </h3>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-tiffany/0 group-hover:bg-tiffany/5 transition-colors duration-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
