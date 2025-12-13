import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Phone, Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { SearchDialog } from "./SearchDialog";

const navigation = [
  { name: "Каталог", href: "/catalog" },
  { name: "Популярные подборки", href: "/popular" },
  { name: "Доставка и оплата", href: "/delivery" },
  { name: "Гарантия", href: "/guarantee" },
  { name: "Отзывы", href: "/reviews" },
  { name: "Контакты", href: "/contacts" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top bar */}
      <div className="hidden md:block border-b border-border/30 bg-warm-cream">
        <div className="container-custom">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-tiffany" />
                <span>Пн-Вс: 9:00 - 21:00</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="tel:+79001234567" 
                className="flex items-center gap-2 font-medium text-foreground hover:text-tiffany transition-colors"
              >
                <Phone className="h-4 w-4 text-tiffany" />
                +7 (900) 123-45-67
              </a>
              <Button variant="tiffanyOutline" size="sm">
                Заказать звонок
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cta animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">FlyArt</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Воздушные шары</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-tiffany transition-colors rounded-lg hover:bg-tiffany-light/50"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <SearchDialog />
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cta text-cta-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              </Button>
            </Link>

            <Button variant="cta" className="hidden md:flex">
              Заказать шары
            </Button>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="px-4">
                    <SearchDialog variant="full" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 text-base font-medium text-foreground hover:text-tiffany hover:bg-tiffany-light/50 rounded-lg transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="gold-line" />
                  
                  <div className="flex flex-col gap-3 px-4">
                    <a 
                      href="tel:+79001234567" 
                      className="flex items-center gap-2 font-medium text-foreground"
                    >
                      <Phone className="h-5 w-5 text-tiffany" />
                      +7 (900) 123-45-67
                    </a>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      Пн-Вс: 9:00 - 21:00
                    </div>
                  </div>

                  <Link to="/cart" onClick={() => setIsOpen(false)} className="mx-4">
                    <Button variant="tiffanyOutline" size="lg" className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Корзина ({totalItems})
                    </Button>
                  </Link>

                  <Button variant="cta" size="lg" className="mx-4">
                    Заказать шары
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
