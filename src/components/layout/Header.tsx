import { useState } from "react";
import { Link } from "react-router-dom";
import logoMuha from "@/assets/logo-muha.png";
import { Menu, Phone, Clock, ShoppingCart, LayoutGrid, Truck, Shield, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { SearchDialog } from "./SearchDialog";
import { CallbackDialog } from "@/components/CallbackDialog";
const navigation = [
  { name: "Каталог", href: "/catalog", icon: LayoutGrid, highlight: true },
  { name: "Доставка и оплата", href: "/delivery", icon: Truck },
  { name: "Гарантия", href: "/guarantee", icon: Shield },
  { name: "Отзывы", href: "/reviews", icon: Star },
  { name: "Контакты", href: "/contacts", icon: MapPin },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">

      {/* Main header */}
      <div className="container-custom">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark flex items-center justify-center shadow-sm">
              <img src={logoMuha} alt="FlyArt" className="absolute h-12 w-12 object-contain -top-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">FlyArt</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Воздушные шары</span>
            </div>
          </Link>

          {/* Catalog button */}
          <Link
            to="/catalog"
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-tiffany text-white rounded-full font-medium text-sm hover:bg-tiffany-dark transition-colors shadow-sm"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Каталог</span>
          </Link>

          {/* Desktop Search - center */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchDialog variant="header" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:inline-flex items-center gap-1">
            {navigation.filter(item => !item.highlight).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-tiffany transition-colors whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="md:hidden">
              <SearchDialog />
            </div>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cta text-cta-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              </Button>
            </Link>

            <Button 
              variant="cta" 
              className="hidden md:flex whitespace-nowrap"
              onClick={() => setCallbackOpen(true)}
            >
              Заказать
            </Button>
            <CallbackDialog open={callbackOpen} onOpenChange={setCallbackOpen} showTrigger={false} />

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
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:text-tiffany hover:bg-tiffany-light/50 rounded-lg transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="gold-line" />
                  
                  <div className="flex flex-col gap-3 px-4">
                    <a 
                      href="tel:+79237714004" 
                      className="flex items-center gap-2 font-medium text-foreground"
                    >
                      <Phone className="h-5 w-5 text-tiffany" />
                      +7 (923) 771-40-04
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

                  <Button 
                    variant="cta" 
                    size="lg" 
                    className="mx-4"
                    onClick={() => {
                      setIsOpen(false);
                      setCallbackOpen(true);
                    }}
                  >
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
