import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Search, Plus, X, Package, FolderTree } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
}

interface CollectionEditorProps {
  collection: Collection | null;
  onClose: () => void;
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  is_active: true,
  starts_at: '',
  ends_at: '',
};

export default function CollectionEditor({ collection, onClose }: CollectionEditorProps) {
  const [form, setForm] = useState(emptyForm);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (collection) {
      setForm({
        name: collection.name,
        slug: collection.slug,
        description: collection.description || '',
        image_url: collection.image_url || '',
        is_active: collection.is_active,
        starts_at: collection.starts_at?.split('T')[0] || '',
        ends_at: collection.ends_at?.split('T')[0] || '',
      });
      loadExistingItems(collection.id);
    }
  }, [collection]);

  const loadExistingItems = async (collectionId: string) => {
    const { data } = await supabase
      .from('collection_items')
      .select('product_id, category_id')
      .eq('collection_id', collectionId);

    if (data) {
      setSelectedProducts(data.filter(i => i.product_id).map(i => i.product_id!));
      setSelectedCategories(data.filter(i => i.category_id).map(i => i.category_id!));
    }
  };

  const { data: products } = useQuery({
    queryKey: ['admin-products-search', productSearch],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, title, sku, price, product_images(url, is_main)')
        .eq('is_active', true)
        .order('title')
        .limit(20);

      if (productSearch) {
        query = query.or(`title.ilike.%${productSearch}%,sku.ilike.%${productSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const collectionData = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').replace(/-+/g, '-'),
        description: form.description || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };

      let collectionId: string;

      if (collection) {
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', collection.id);
        if (error) throw error;
        collectionId = collection.id;

        // Delete existing items
        await supabase.from('collection_items').delete().eq('collection_id', collectionId);
      } else {
        const { data, error } = await supabase
          .from('collections')
          .insert({ ...collectionData, sort_order: 0 })
          .select('id')
          .single();
        if (error) throw error;
        collectionId = data.id;
      }

      // Insert new items
      const items = [
        ...selectedProducts.map((product_id, i) => ({
          collection_id: collectionId,
          product_id,
          sort_order: i,
        })),
        ...selectedCategories.map((category_id, i) => ({
          collection_id: collectionId,
          category_id,
          sort_order: selectedProducts.length + i,
        })),
      ];

      if (items.length > 0) {
        const { error: itemsError } = await supabase.from('collection_items').insert(items);
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      toast.success(collection ? 'Подборка обновлена' : 'Подборка создана');
      onClose();
    },
    onError: (error: any) => {
      toast.error('Ошибка сохранения: ' + (error.message || 'Неизвестная ошибка'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Введите название подборки');
      return;
    }
    saveMutation.mutate();
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getProductImage = (product: any) => {
    const main = product.product_images?.find((img: any) => img.is_main);
    return main?.url || product.product_images?.[0]?.url || null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Основное</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="8 марта, Новый год..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>URL (slug)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Автогенерация из названия"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Описание подборки для посетителей..."
            />
          </div>

          <div className="space-y-2">
            <Label>URL изображения</Label>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Дата начала показа</Label>
              <Input
                type="date"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания показа</Label>
              <Input
                type="date"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
            <Label>Активная подборка</Label>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Выбранные товары ({selectedProducts.length})</Label>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {products?.filter(p => selectedProducts.includes(p.id)).map(product => (
                  <Badge key={product.id} variant="secondary" className="gap-1">
                    {product.title}
                    <button type="button" onClick={() => toggleProduct(product.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Поиск товаров..."
              className="pl-10"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
            {products?.map(product => (
              <div
                key={product.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                  selectedProducts.includes(product.id) ? 'bg-primary/10' : ''
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                {getProductImage(product) ? (
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
                  <p className="text-sm text-muted-foreground">{product.price} ₽</p>
                </div>
                {selectedProducts.includes(product.id) && (
                  <Badge>Выбран</Badge>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Выбранные категории ({selectedCategories.length})</Label>
            <p className="text-sm text-muted-foreground">
              Все товары из выбранных категорий будут добавлены в подборку
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {categories?.map(category => (
              <div
                key={category.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                  selectedCategories.includes(category.id) ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <FolderTree className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1">{category.name}</span>
                {selectedCategories.includes(category.id) && (
                  <Badge>Выбрана</Badge>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {collection ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
