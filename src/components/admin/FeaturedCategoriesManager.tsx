import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Star, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

interface FeaturedCategory {
  id: string;
  category_id: string;
  custom_image_url: string | null;
  custom_title: string | null;
  sort_order: number;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
  };
}

export function FeaturedCategoriesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeaturedCategory | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    custom_image_url: '',
    custom_title: '',
    sort_order: '0',
    is_active: true,
  });
  const queryClient = useQueryClient();

  // Fetch featured categories
  const { data: featuredCategories, isLoading } = useQuery({
    queryKey: ['admin-featured-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_categories')
        .select(`
          *,
          category:categories(id, name, slug, image_url)
        `)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as FeaturedCategory[];
    },
  });

  // Fetch all categories for selection
  const { data: allCategories } = useQuery({
    queryKey: ['admin-all-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Get available categories (not already featured)
  const availableCategories = allCategories?.filter(
    (cat) =>
      !featuredCategories?.some((fc) => fc.category_id === cat.id) ||
      editingItem?.category_id === cat.id
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const itemData = {
        category_id: formData.category_id,
        custom_image_url: formData.custom_image_url || null,
        custom_title: formData.custom_title || null,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('featured_categories')
          .update(itemData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('featured_categories')
          .insert(itemData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-categories'] });
      toast.success(editingItem ? 'Раздел обновлён' : 'Раздел добавлен');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка сохранения');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('featured_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-categories'] });
      toast.success('Раздел удалён');
    },
    onError: () => {
      toast.error('Ошибка удаления');
    },
  });

  const updateSortMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      if (!featuredCategories) return;
      const index = featuredCategories.findIndex((fc) => fc.id === id);
      if (index === -1) return;
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= featuredCategories.length) return;

      const currentItem = featuredCategories[index];
      const targetItem = featuredCategories[targetIndex];

      await supabase
        .from('featured_categories')
        .update({ sort_order: targetItem.sort_order })
        .eq('id', currentItem.id);
      await supabase
        .from('featured_categories')
        .update({ sort_order: currentItem.sort_order })
        .eq('id', targetItem.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-categories'] });
    },
  });

  const resetForm = () => {
    setFormData({
      category_id: '',
      custom_image_url: '',
      custom_title: '',
      sort_order: '0',
      is_active: true,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: FeaturedCategory) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      custom_image_url: item.custom_image_url || '',
      custom_title: item.custom_title || '',
      sort_order: item.sort_order?.toString() || '0',
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.error('Выберите категорию');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Популярные разделы
        </CardTitle>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить раздел
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">
                {editingItem ? 'Редактирование раздела' : 'Добавить в популярные'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_title">Кастомный заголовок</Label>
                <Input
                  id="custom_title"
                  value={formData.custom_title}
                  onChange={(e) => setFormData({ ...formData, custom_title: e.target.value })}
                  placeholder="Оставьте пустым для использования названия категории"
                />
              </div>

              <ImageUploader
                value={formData.custom_image_url}
                onChange={(url) => setFormData({ ...formData, custom_image_url: url })}
                folder="featured"
                label="Кастомная обложка"
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Если не указана — используется обложка категории или фото товара
              </p>

              <div className="flex items-center justify-between">
                <Label>Активен</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingItem ? 'Сохранить' : 'Добавить'}
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
        ) : featuredCategories && featuredCategories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Фото</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Кастомный заголовок</TableHead>
                <TableHead className="text-center">Активен</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featuredCategories.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {(item.custom_image_url || item.category?.image_url) ? (
                      <img
                        src={item.custom_image_url || item.category?.image_url || ''}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                        Нет
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.category?.name || 'Не найдена'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.custom_title || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.is_active ? (
                      <span className="text-green-600">Да</span>
                    ) : (
                      <span className="text-muted-foreground">Нет</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateSortMutation.mutate({ id: item.id, direction: 'up' })}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateSortMutation.mutate({ id: item.id, direction: 'down' })}
                        disabled={index === featuredCategories.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Удалить из популярных?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Популярные разделы не настроены</p>
            <p className="text-sm text-muted-foreground">
              Добавьте категории, которые будут отображаться на главной странице
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
