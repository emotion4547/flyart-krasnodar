import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    slug: '',
    description: '',
    full_text: '',
    price: '',
    price_old: '',
    quantity: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    is_active: true,
    is_hit: false,
    is_new: false,
    is_sale: false,
    sort_order: '0',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    external_id: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (id, url, is_main, alt_text),
          product_categories (category_id)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        sku: product.sku || '',
        slug: product.slug || '',
        description: product.description || '',
        full_text: product.full_text || '',
        price: product.price?.toString() || '',
        price_old: product.price_old?.toString() || '',
        quantity: product.quantity?.toString() || '',
        weight: product.weight?.toString() || '',
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        height: product.height?.toString() || '',
        is_active: product.is_active ?? true,
        is_hit: product.is_hit ?? false,
        is_new: product.is_new ?? false,
        is_sale: product.is_sale ?? false,
        sort_order: product.sort_order?.toString() || '0',
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
        seo_keywords: product.seo_keywords || '',
        og_title: product.og_title || '',
        og_description: product.og_description || '',
        og_image: product.og_image || '',
        external_id: product.external_id || '',
      });
      if (product.product_categories) {
        setSelectedCategories(product.product_categories.map((pc: any) => pc.category_id));
      }
      if (product.product_images && product.product_images.length > 0) {
        const main = product.product_images.find((img: any) => img.is_main);
        setImageUrl(main?.url || product.product_images[0]?.url || '');
      }
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const productData = {
        title: formData.title,
        sku: formData.sku,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || null,
        full_text: formData.full_text || null,
        price: parseFloat(formData.price) || 0,
        price_old: formData.price_old ? parseFloat(formData.price_old) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        is_active: formData.is_active,
        is_hit: formData.is_hit,
        is_new: formData.is_new,
        is_sale: formData.is_sale,
        sort_order: parseInt(formData.sort_order) || 0,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: formData.seo_keywords || null,
        og_title: formData.og_title || null,
        og_description: formData.og_description || null,
        og_image: formData.og_image || null,
        external_id: formData.external_id || null,
      };

      let productId = id;

      if (isNew) {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      } else {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        if (error) throw error;
      }

      // Update categories
      await supabase.from('product_categories').delete().eq('product_id', productId);
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map((categoryId) => ({
          product_id: productId,
          category_id: categoryId,
        }));
        await supabase.from('product_categories').insert(categoryInserts);
      }

      // Update main image
      if (imageUrl) {
        await supabase.from('product_images').delete().eq('product_id', productId);
        await supabase.from('product_images').insert({
          product_id: productId,
          url: imageUrl,
          is_main: true,
        });
      }

      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      toast.success(isNew ? 'Товар создан' : 'Товар сохранён');
      if (isNew) {
        navigate(`/admin4547/products/${productId}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка сохранения');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.sku || !formData.price) {
      toast.error('Заполните обязательные поля: название, артикул, цена');
      return;
    }
    saveMutation.mutate();
  };

  if (!isNew && loadingProduct) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin4547/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {isNew ? 'Новый товар' : 'Редактирование товара'}
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="main" className="space-y-6">
          <TabsList>
            <TabsTrigger value="main">Основное</TabsTrigger>
            <TabsTrigger value="prices">Цены и наличие</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="display">Отображение</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">Артикул / SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Оставьте пустым для автогенерации"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Категории</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {categories?.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, cat.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter((c) => c !== cat.id));
                            }
                          }}
                        />
                        <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">
                          {cat.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Краткое описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_text">Полное описание</Label>
                  <Textarea
                    id="full_text"
                    value={formData.full_text}
                    onChange={(e) => setFormData({ ...formData, full_text: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL изображения</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Цены и наличие</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_old">Старая цена</Label>
                    <Input
                      id="price_old"
                      type="number"
                      value={formData.price_old}
                      onChange={(e) => setFormData({ ...formData, price_old: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Вес (кг)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Длина (см)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Ширина (см)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Высота (см)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external_id">Внешний ID</Label>
                  <Input
                    id="external_id"
                    value={formData.external_id}
                    onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
                    placeholder="Для синхронизации с внешними системами"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">{formData.seo_title.length}/60 символов</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{formData.seo_description.length}/160 символов</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">SEO Keywords</Label>
                  <Input
                    id="seo_keywords"
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                    placeholder="ключевые, слова, через, запятую"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Open Graph</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="og_title">OG Title</Label>
                      <Input
                        id="og_title"
                        value={formData.og_title}
                        onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="og_description">OG Description</Label>
                      <Textarea
                        id="og_description"
                        value={formData.og_description}
                        onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="og_image">OG Image URL</Label>
                      <Input
                        id="og_image"
                        value={formData.og_image}
                        onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Отображение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>В продаже</Label>
                    <p className="text-sm text-muted-foreground">Товар отображается на сайте</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Хит продаж</Label>
                    <p className="text-sm text-muted-foreground">Отображает бейдж "Хит"</p>
                  </div>
                  <Switch
                    checked={formData.is_hit}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_hit: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Новинка</Label>
                    <p className="text-sm text-muted-foreground">Отображает бейдж "Новинка"</p>
                  </div>
                  <Switch
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Акция</Label>
                    <p className="text-sm text-muted-foreground">Отображает бейдж "Акция"</p>
                  </div>
                  <Switch
                    checked={formData.is_sale}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_sale: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Порядок сортировки</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Меньшее значение = выше в списке</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
