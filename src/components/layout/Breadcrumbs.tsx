import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeNames: Record<string, string> = {
  catalog: "Каталог",
  delivery: "Доставка и оплата",
  guarantee: "Гарантия",
  reviews: "Отзывы",
  contacts: "Контакты",
  privacy: "Политика конфиденциальности",
  offer: "Публичная оферта",
  sitemap: "Карта сайта",
  cart: "Корзина",
  checkout: "Оформление заказа",
  product: "Товар",
};

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
}

export function Breadcrumbs({ items, currentPage }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Generate breadcrumbs from URL if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Try to get readable name from routeNames
      const label = routeNames[segment] || decodeURIComponent(segment);
      
      breadcrumbs.push({
        label: isLast && currentPage ? currentPage : label,
        href: isLast ? undefined : currentPath,
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-tiffany transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">Главная</span>
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-1" />
            {item.href ? (
              <Link 
                to={item.href}
                className="text-muted-foreground hover:text-tiffany transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
