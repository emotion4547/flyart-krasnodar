import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, FolderTree, Loader2, GripVertical, Package, X, Search } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

interface Product {
  id: string;
  title: string;
  sku: string;
  price: number;
  product_images: { url: string; is_main: boolean }[] | null;
}

function SortableCategoryRow({ 
  category, 
  onEdit, 
  onDelete,
  onManageProducts,
  productCount 
}: { 
  category: Category; 
  onEdit: (cat: Category) => void; 
  onDelete: (id: string) => void;
  onManageProducts: (cat: Category) => void;
  productCount: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-background border rounded-lg mb-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      {category.image_url && (
        <img 
          src={category.image_url} 
          alt={category.name}
          className="w-10 h-10 object-cover rounded"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{category.name}</p>
        <p className="text-sm text-muted-foreground truncate">{category.slug}</p>
      </div>
      
      <Badge variant="secondary" className="shrink-0">
        {productCount} товаров
      </Badge>
      
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onManageProducts(category)}
          title="Управление товарами"
        >
          <Package className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(category.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CategoriesContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingCategory, setManagingCategory] = useState<Category | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    sort_order: '0',
  });
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: productCounts } = useQuery({
    queryKey: ['category-product-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('category_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(pc => {
        counts[pc.category_id] = (counts[pc.category_id] || 0) + 1;
      });
      return counts;
    },
  });

  const { data: allProducts } = useQuery({
    queryKey: ['admin-all-products-for-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, price, product_images(url, is_main)')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categoryProducts, refetch: refetchCategoryProducts } = useQuery({
    queryKey: ['category-products', managingCategory?.id],
    queryFn: async () => {
      if (!managingCategory) return [];
      const { data, error } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', managingCategory.id);
      if (error) throw error;
      return data.map(pc => pc.product_id);
    },
    enabled: !!managingCategory,
  });

  useEffect(() => {
    if (categoryProducts) {
      setSelectedProductIds(new Set(categoryProducts));
    }
  }, [categoryProducts]);

  const reorderMutation = useMutation({
    mutationFn: async (reorderedCategories: Category[]) => {
      const updates = reorderedCategories.map((cat, index) => ({
        id: cat.id,
        sort_order: index,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('categories')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Порядок категорий сохранён');
    },
    onError: () => {
      toast.error('Ошибка сохранения порядка');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const categoryData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || null,
        image_url: formData.image_url || null,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: formData.seo_keywords || null,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editingCategory ? 'Категория обновлена' : 'Категория создана');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка сохранения');
    },
  });

  const saveProductsMutation = useMutation({
    mutationFn: async () => {
      if (!managingCategory) return;
      
      // Delete existing associations
      await supabase
        .from('product_categories')
        .delete()
        .eq('category_id', managingCategory.id);
      
      // Insert new associations
      if (selectedProductIds.size > 0) {
        const inserts = Array.from(selectedProductIds).map(productId => ({
          product_id: productId,
          category_id: managingCategory.id,
        }));
        
        const { error } = await supabase
          .from('product_categories')
          .insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-product-counts'] });
      queryClient.invalidateQueries({ queryKey: ['category-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Товары категории обновлены');
      setIsProductsDialogOpen(false);
      setManagingCategory(null);
    },
    onError: () => {
      toast.error('Ошибка сохранения товаров');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении категории');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      sort_order: '0',
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image_url: category.image_url || '',
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || '',
      seo_keywords: category.seo_keywords || '',
      sort_order: category.sort_order?.toString() || '0',
    });
    setIsDialogOpen(true);
  };

  const handleManageProducts = (category: Category) => {
    setManagingCategory(category);
    setProductSearch('');
    setIsProductsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Введите название категории');
      return;
    }
    saveMutation.mutate();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && categories) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);
      
      const reordered = arrayMove(categories, oldIndex, newIndex);
      reorderMutation.mutate(reordered);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const getMainImage = (images: Product['product_images']) => {
    if (!images || images.length === 0) return null;
    const main = images.find(img => img.is_main);
    return main?.url || images[0]?.url;
  };

  const filteredProducts = allProducts?.filter(product => 
    product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Список категорий</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить категорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Редактирование категории' : 'Новая категория'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Автогенерация из названия"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <ImageUploader
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="categories"
                label="Обложка категории"
              />

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">SEO настройки</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      maxLength={60}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      maxLength={160}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_keywords">SEO Keywords</Label>
                    <Input
                      id="seo_keywords"
                      value={formData.seo_keywords}
                      onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {categories.map((category) => (
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={(id) => {
                      if (confirm('Удалить категорию?')) {
                        deleteMutation.mutate(id);
                      }
                    }}
                    onManageProducts={handleManageProducts}
                    productCount={productCounts?.[category.id] || 0}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12">
            <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Категории не найдены</p>
          </div>
        )}
      </CardContent>

      {/* Products Management Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={(open) => {
        setIsProductsDialogOpen(open);
        if (!open) {
          setManagingCategory(null);
          setSelectedProductIds(new Set());
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Товары в категории «{managingCategory?.name}»
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Выбрано: {selectedProductIds.size} товаров</span>
              {selectedProductIds.size > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedProductIds(new Set())}
                >
                  Снять выбор
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredProducts.map(product => {
                  const isSelected = selectedProductIds.has(product.id);
                  const mainImage = getMainImage(product.product_images);
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <Checkbox checked={isSelected} />
                      
                      {mainImage ? (
                        <img 
                          src={mainImage} 
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.sku} • {product.price} ₽</p>
                      </div>
                    </div>
                  );
                })}
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Товары не найдены
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsProductsDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button 
                onClick={() => saveProductsMutation.mutate()}
                disabled={saveProductsMutation.isPending}
              >
                {saveProductsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Сохранить ({selectedProductIds.size})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
