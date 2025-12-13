import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for products
const products = [
  {
    id: "1",
    title: "Набор «Розовая мечта» — 15 шаров с конфетти",
    sku: "FA-001",
    price: 2490,
    priceOld: 2990,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    isHit: true,
    isSale: true,
  },
  {
    id: "2",
    title: "Фонтан из фольгированных звёзд «Космос»",
    sku: "FA-002",
    price: 3290,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=400&fit=crop",
    isNew: true,
  },
  {
    id: "3",
    title: "Букет «Нежность» — пастельные тона",
    sku: "FA-003",
    price: 1890,
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=400&fit=crop",
    isHit: true,
  },
  {
    id: "4",
    title: "Композиция «День рождения» с цифрой",
    sku: "FA-004",
    price: 4590,
    priceOld: 5200,
    image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&h=400&fit=crop",
    isSale: true,
  },
  {
    id: "5",
    title: "Набор «Голубые облака» для мальчика",
    sku: "FA-005",
    price: 2190,
    image: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    title: "Фонтан «Золотой праздник»",
    sku: "FA-006",
    price: 3890,
    image: "https://images.unsplash.com/photo-1504389896320-ac2e038a2f16?w=400&h=400&fit=crop",
    isNew: true,
    isHit: true,
  },
  {
    id: "7",
    title: "Коробка-сюрприз с шарами",
    sku: "FA-007",
    price: 5490,
    priceOld: 6500,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    isSale: true,
  },
  {
    id: "8",
    title: "Арка из шаров «Радуга»",
    sku: "FA-008",
    price: 7990,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop",
  },
];

export function PopularProducts() {
  return (
    <section className="section-padding bg-warm-cream">
      <div className="container-custom">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Популярные композиции
            </h2>
            <div className="gold-line max-w-xs mb-4" />
            <p className="text-muted-foreground max-w-xl">
              Наши бестселлеры — проверенные временем наборы, которые всегда радуют
            </p>
          </div>
          <Link to="/catalog">
            <Button variant="tiffanyOutline" className="group">
              Все товары
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
