import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, MessageSquare, ExternalLink } from 'lucide-react';

interface Review {
  id: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  text: string;
  source: string | null;
  source_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const emptyReview = {
  author_name: '',
  author_avatar: '',
  rating: 5,
  text: '',
  source: '',
  source_url: '',
  is_active: true,
  sort_order: 0,
};

export default function ReviewsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState(emptyReview);
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Review[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyReview) => {
      const { error } = await supabase.from('reviews').insert({
        author_name: data.author_name,
        author_avatar: data.author_avatar || null,
        rating: data.rating,
        text: data.text,
        source: data.source || null,
        source_url: data.source_url || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Отзыв добавлен');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Ошибка при добавлении отзыва');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof emptyReview }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          author_name: data.author_name,
          author_avatar: data.author_avatar || null,
          rating: data.rating,
          text: data.text,
          source: data.source || null,
          source_url: data.source_url || null,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Отзыв обновлён');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Ошибка при обновлении отзыва');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Статус отзыва обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Отзыв удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении отзыва');
    },
  });

  const handleOpenCreate = () => {
    setEditingReview(null);
    setFormData(emptyReview);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      author_name: review.author_name,
      author_avatar: review.author_avatar || '',
      rating: review.rating,
      text: review.text,
      source: review.source || '',
      source_url: review.source_url || '',
      is_active: review.is_active,
      sort_order: review.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReview(null);
    setFormData(emptyReview);
  };

  const handleSubmit = () => {
    if (!formData.author_name.trim() || !formData.text.trim()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    if (editingReview) {
      updateMutation.mutate({ id: editingReview.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Отзывы</h1>
          <p className="text-muted-foreground">Управление отзывами клиентов</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить отзыв
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Список отзывов</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Автор</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead className="max-w-[300px]">Отзыв</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {review.author_avatar ? (
                          <img
                            src={review.author_avatar}
                            alt={review.author_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-tiffany-light flex items-center justify-center">
                            <span className="text-tiffany-dark font-medium">
                              {review.author_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{review.author_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm text-muted-foreground">
                        {review.text}
                      </p>
                    </TableCell>
                    <TableCell>
                      {review.source ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{review.source}</Badge>
                          {review.source_url && (
                            <a
                              href={review.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Скрыт</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: review.id,
                              is_active: !review.is_active,
                            })
                          }
                        >
                          {review.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(review)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Удалить отзыв?')) {
                              deleteMutation.mutate(review.id);
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
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Отзывов пока нет</p>
              <Button className="mt-4" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый отзыв
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? 'Редактировать отзыв' : 'Новый отзыв'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя автора *</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name: e.target.value })
                  }
                  placeholder="Иван Иванов"
                />
              </div>
              <div className="space-y-2">
                <Label>Рейтинг</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(val) =>
                    setFormData({ ...formData, rating: parseInt(val) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {r} {r === 1 ? 'звезда' : r < 5 ? 'звезды' : 'звёзд'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL аватара</Label>
              <Input
                value={formData.author_avatar}
                onChange={(e) =>
                  setFormData({ ...formData, author_avatar: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Текст отзыва *</Label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Текст отзыва клиента..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Источник</Label>
                <Input
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="Яндекс, 2ГИС..."
                />
              </div>
              <div className="space-y-2">
                <Label>Ссылка на источник</Label>
                <Input
                  value={formData.source_url}
                  onChange={(e) =>
                    setFormData({ ...formData, source_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Порядок сортировки</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onValueChange={(val) =>
                    setFormData({ ...formData, is_active: val === 'active' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Скрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingReview ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
