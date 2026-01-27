import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Play, ExternalLink, GripVertical } from "lucide-react";
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

interface VKClip {
  id: string;
  title: string | null;
  vk_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface SortableClipRowProps {
  clip: VKClip;
  index: number;
  onEdit: (clip: VKClip) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, is_active: boolean) => void;
}

function SortableClipRow({ clip, index, onEdit, onDelete, onToggleActive }: SortableClipRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clip.id });

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
      
      <div className="w-8 text-center text-muted-foreground font-medium">
        {index + 1}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{clip.title || "Без названия"}</p>
        <a
          href={clip.vk_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Открыть в VK
        </a>
      </div>
      
      <Switch
        checked={clip.is_active}
        onCheckedChange={(checked) => onToggleActive(clip.id, checked)}
      />
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(clip)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm("Удалить этот клип?")) {
              onDelete(clip.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function VKClipsContent() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClip, setEditingClip] = useState<VKClip | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    vk_url: "",
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["admin-vk-clips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vk_clips")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as VKClip[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string; sort_order?: number }) => {
      if (data.id) {
        const { error } = await supabase
          .from("vk_clips")
          .update({
            title: data.title || null,
            vk_url: data.vk_url,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vk_clips").insert({
          title: data.title || null,
          vk_url: data.vk_url,
          sort_order: data.sort_order ?? clips.length,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vk-clips"] });
      queryClient.invalidateQueries({ queryKey: ["vk-clips"] });
      toast.success(editingClip ? "Клип обновлен" : "Клип добавлен");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Ошибка сохранения", { description: error.message });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedClips: { id: string; sort_order: number }[]) => {
      const updates = reorderedClips.map(({ id, sort_order }) =>
        supabase.from("vk_clips").update({ sort_order }).eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vk-clips"] });
      toast.success("Порядок сохранен");
    },
    onError: (error) => {
      toast.error("Ошибка сохранения порядка", { description: error.message });
      queryClient.invalidateQueries({ queryKey: ["admin-vk-clips"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vk_clips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vk-clips"] });
      queryClient.invalidateQueries({ queryKey: ["vk-clips"] });
      toast.success("Клип удален");
    },
    onError: (error) => {
      toast.error("Ошибка удаления", { description: error.message });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("vk_clips")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vk-clips"] });
      queryClient.invalidateQueries({ queryKey: ["vk-clips"] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = clips.findIndex((clip) => clip.id === active.id);
      const newIndex = clips.findIndex((clip) => clip.id === over.id);
      
      const reordered = arrayMove(clips, oldIndex, newIndex);
      
      queryClient.setQueryData(["admin-vk-clips"], reordered);
      
      reorderMutation.mutate(
        reordered.map((clip, index) => ({ id: clip.id, sort_order: index }))
      );
    }
  };

  const handleOpenDialog = (clip?: VKClip) => {
    if (clip) {
      setEditingClip(clip);
      setFormData({
        title: clip.title || "",
        vk_url: clip.vk_url,
        is_active: clip.is_active,
      });
    } else {
      setEditingClip(null);
      setFormData({
        title: "",
        vk_url: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClip(null);
    setFormData({ title: "", vk_url: "", is_active: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vk_url.includes("vk.com/clip")) {
      toast.error("Неверный формат ссылки", {
        description: "Ссылка должна быть в формате https://vk.com/clip...",
      });
      return;
    }
    saveMutation.mutate({ 
      ...formData, 
      id: editingClip?.id,
      sort_order: clips.length,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Перетаскивайте клипы для изменения порядка
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить клип
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClip ? "Редактировать клип" : "Добавить клип"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vk_url">Ссылка на VK клип *</Label>
                <Input
                  id="vk_url"
                  value={formData.vk_url}
                  onChange={(e) =>
                    setFormData({ ...formData, vk_url: e.target.value })
                  }
                  placeholder="https://vk.com/clip-206638918_456239179"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Скопируйте ссылку из адресной строки VK
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Название (необязательно)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Композиция для дня рождения"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Показывать на сайте</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Загрузка...
        </div>
      ) : clips.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Нет клипов</h3>
          <p className="text-muted-foreground mb-4">
            Добавьте VK клипы для отображения на главной странице
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить первый клип
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={clips.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {clips.map((clip, index) => (
                <SortableClipRow
                  key={clip.id}
                  clip={clip}
                  index={index}
                  onEdit={handleOpenDialog}
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
    </div>
  );
}
