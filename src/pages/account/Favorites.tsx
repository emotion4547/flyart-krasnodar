import { Link } from 'react-router-dom';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AccountFavorites = () => {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  const handleAddToCart = (favorite: typeof favorites[0]) => {
    if (!favorite.product) return;
    
    addItem({
      id: favorite.product.id,
      title: favorite.product.title,
      price: favorite.product.price,
      image: favorite.mainImage || '/placeholder.svg',
      slug: favorite.product.slug,
      sku: favorite.product.id.slice(0, 8).toUpperCase(),
    });
    toast.success('Добавлено в корзину');
  };

  return (
    <AccountLayout title="Избранное">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            В избранном пусто
          </h2>
          <p className="text-muted-foreground mb-4">
            Добавляйте понравившиеся товары в избранное
          </p>
          <Link to="/catalog">
            <Button variant="cta">Перейти в каталог</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const product = favorite.product;
            if (!product || !product.is_active) return null;

            return (
              <div
                key={favorite.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden group"
              >
                <Link to={`/product/${product.slug}`} className="block">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={favorite.mainImage || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-medium text-foreground line-clamp-2 hover:text-tiffany transition-colors mb-2">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-foreground">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.price_old && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.price_old.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="cta"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(favorite)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      В корзину
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
};

export default AccountFavorites;
