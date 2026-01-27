import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Layers, Loader2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CollectionEditor from './CollectionEditor';

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
  created_at: string;
}

interface SortableRowProps {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, is_active: boolean) => void;
}

function SortableRow({ collection, onEdit, onDelete, onToggleActive }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-card border rounded-lg ${
        isDragging ? "shadow-lg ring-2 ring-primary" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      {collection.image_url ? (
        <img
          src={collection.image_url}
          alt={collection.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
          <Layers className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium">{collection.name}</p>
        <p className="text-sm text-muted-foreground truncate">
          {collection.description || 'Без описания'}
        </p>
        <p className="text-xs text-muted-foreground">/{collection.slug}</p>
      </div>
      
      <Badge variant={collection.is_active ? "default" : "secondary"}>
        {collection.is_active ? 'Активна' : 'Скрыта'}
      </Badge>
      
      <Switch
        checked={collection.is_active}
        onCheckedChange={(checked) => onToggleActive(collection.id, checked)}
      />
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(collection)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm("Удалить подборку?")) {
              onDelete(collection.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function CollectionsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Collection[];
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: { id: string; sort_order: number }[]) => {
      const updates = reordered.map(({ id, sort_order }) =>
        supabase.from("collections").update({ sort_order }).eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      toast.success("Порядок сохранен");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.error("Ошибка сохранения порядка");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      toast.success('Подборка удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении подборки');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('collections')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      toast.success('Статус подборки обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((c) => c.id === active.id);
      const newIndex = collections.findIndex((c) => c.id === over.id);
      
      const reordered = arrayMove(collections, oldIndex, newIndex);
      
      queryClient.setQueryData(["admin-collections"], reordered);
      
      reorderMutation.mutate(
        reordered.map((c, index) => ({ id: c.id, sort_order: index }))
      );
    }
  };

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCollection(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Тематические подборки товаров для праздников
        </p>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Создать подборку
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Нет подборок</h3>
          <p className="text-muted-foreground mb-4">
            Создайте тематическую подборку для праздников
          </p>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Создать первую подборку
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={collections.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {collections.map((collection) => (
                <SortableRow
                  key={collection.id}
                  collection={collection}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onToggleActive={(id, is_active) =>
                    toggleActiveMutation.mutate({ id, is_active })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCollection ? 'Редактировать подборку' : 'Новая подборка'}
            </DialogTitle>
          </DialogHeader>
          <CollectionEditor
            collection={editingCollection}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
