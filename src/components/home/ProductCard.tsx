import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  sku: string;
  price: number;
  priceOld?: number;
  image: string;
  isHit?: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

export function ProductCard({
  id,
  slug,
  title,
  sku,
  price,
  priceOld,
  image,
  isHit,
  isNew,
  isSale,
}: ProductCardProps) {
  const discount = priceOld ? Math.round((1 - price / priceOld) * 100) : 0;
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id,
      slug,
      title,
      sku,
      price,
      priceOld,
      image,
    });
    toast({
      title: "Добавлено в корзину",
      description: title,
    });
  };

  return (
    <article className="card-product group">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-warm-cream">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isHit && <span className="badge-hit">Хит</span>}
          {isNew && <span className="badge-new">Новинка</span>}
          {isSale && discount > 0 && (
            <span className="badge-sale">-{discount}%</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/product/${slug}`}>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-9 w-9 bg-background/90 backdrop-blur-sm hover:bg-tiffany hover:text-primary-foreground shadow-sm"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* SKU */}
        <p className="text-xs text-muted-foreground mb-1">Арт. {sku}</p>
        
        {/* Title */}
        <Link to={`/product/${slug}`}>
          <h3 className="font-medium text-foreground text-sm md:text-base line-clamp-2 mb-3 hover:text-tiffany transition-colors min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-foreground">
            {price.toLocaleString("ru-RU")} ₽
          </span>
          {priceOld && (
            <span className="text-sm text-muted-foreground line-through">
              {priceOld.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Button variant="cta" className="w-full" size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          В корзину
        </Button>
      </div>
    </article>
  );
}
