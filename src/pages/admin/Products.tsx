import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { escapeILike } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Products() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [photoFilter, setPhotoFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search, statusFilter, photoFilter],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (id, url, is_main),
          product_categories (
            category_id,
            categories:category_id (name)
          )
        `)
        .order('sort_order', { ascending: true });

      if (search) {
        const s = escapeILike(search);
        query = query.or(`title.ilike.%${s}%,sku.ilike.%${s}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by photo on client side
      if (photoFilter === 'no_photo') {
        return data.filter(p => !p.product_images || p.product_images.length === 0);
      }
      if (photoFilter === 'with_photo') {
        return data.filter(p => p.product_images && p.product_images.length > 0);
      }
      
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Статус товара обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });

  const hideAllNoPhotoMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', productIds);
      if (error) throw error;
      return productIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`Скрыто ${count} товаров без фото`);
    },
    onError: () => {
      toast.error('Ошибка при скрытии товаров');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Товар удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении товара');
    },
  });

  const getMainImage = (images: any[] | null) => {
    if (!images || images.length === 0) return null;
    const main = images.find((img) => img.is_main);
    return main?.url || images[0]?.url || null;
  };

  const getCategories = (productCategories: any[] | null) => {
    if (!productCategories) return [];
    return productCategories
      .map((pc) => pc.categories?.name)
      .filter(Boolean);
  };

  // Get products without photos for bulk action
  const productsWithoutPhoto = products?.filter(p => !p.product_images || p.product_images.length === 0) || [];
  const activeProductsWithoutPhoto = productsWithoutPhoto.filter(p => p.is_active);

  const handleHideAllNoPhoto = () => {
    if (activeProductsWithoutPhoto.length === 0) {
      toast.info('Нет активных товаров без фото');
      return;
    }
    if (confirm(`Скрыть ${activeProductsWithoutPhoto.length} товаров без фото?`)) {
      hideAllNoPhotoMutation.mutate(activeProductsWithoutPhoto.map(p => p.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Товары</h1>
          <p className="text-muted-foreground">Управление каталогом товаров</p>
        </div>
        <Link to="/admin4547/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или артикулу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все товары</SelectItem>
                <SelectItem value="active">В продаже</SelectItem>
                <SelectItem value="inactive">Скрытые</SelectItem>
              </SelectContent>
            </Select>
            <Select value={photoFilter} onValueChange={setPhotoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фото" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="with_photo">С фото</SelectItem>
                <SelectItem value="no_photo">Без фото</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bulk action for products without photos */}
          {photoFilter === 'no_photo' && activeProductsWithoutPhoto.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <ImageOff className="h-4 w-4" />
                <span className="text-sm">
                  Найдено {activeProductsWithoutPhoto.length} активных товаров без фото
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHideAllNoPhoto}
                disabled={hideAllNoPhotoMutation.isPending}
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Скрыть все
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Фото</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Категории</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const mainImage = getMainImage(product.product_images);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <div className="flex gap-1 mt-1">
                            {product.is_hit && <Badge variant="secondary" className="text-xs">Хит</Badge>}
                            {product.is_new && <Badge variant="secondary" className="text-xs bg-tiffany-light text-tiffany-dark">Новинка</Badge>}
                            {product.is_sale && <Badge variant="destructive" className="text-xs">Акция</Badge>}
                            {!mainImage && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Без фото</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getCategories(product.product_categories).slice(0, 2).map((cat, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                          ))}
                          {getCategories(product.product_categories).length > 2 && (
                            <Badge variant="outline" className="text-xs">+{getCategories(product.product_categories).length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.price} ₽</p>
                          {product.price_old && (
                            <p className="text-sm text-muted-foreground line-through">{product.price_old} ₽</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.is_active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">В продаже</Badge>
                        ) : (
                          <Badge variant="secondary">Скрыт</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActiveMutation.mutate({ id: product.id, is_active: !product.is_active })}
                          >
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Link to={`/admin4547/products/${product.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Удалить товар?')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Товары не найдены</p>
              <Link to="/admin4547/products/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить первый товар
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}