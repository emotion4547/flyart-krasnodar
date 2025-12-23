import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Play, ExternalLink, GripVertical } from "lucide-react";

interface VKClip {
  id: string;
  title: string | null;
  vk_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function VKClips() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClip, setEditingClip] = useState<VKClip | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    vk_url: "",
    sort_order: 0,
    is_active: true,
  });

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
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("vk_clips")
          .update({
            title: data.title || null,
            vk_url: data.vk_url,
            sort_order: data.sort_order,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vk_clips").insert({
          title: data.title || null,
          vk_url: data.vk_url,
          sort_order: data.sort_order,
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

  const handleOpenDialog = (clip?: VKClip) => {
    if (clip) {
      setEditingClip(clip);
      setFormData({
        title: clip.title || "",
        vk_url: clip.vk_url,
        sort_order: clip.sort_order,
        is_active: clip.is_active,
      });
    } else {
      setEditingClip(null);
      setFormData({
        title: "",
        vk_url: "",
        sort_order: clips.length,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClip(null);
    setFormData({ title: "", vk_url: "", sort_order: 0, is_active: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vk_url.includes("vk.com/clip")) {
      toast.error("Неверный формат ссылки", {
        description: "Ссылка должна быть в формате https://vk.com/clip...",
      });
      return;
    }
    saveMutation.mutate({ ...formData, id: editingClip?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">VK Клипы</h1>
          <p className="text-muted-foreground">
            Управление галереей видео на главной странице
          </p>
        </div>
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
              <div className="space-y-2">
                <Label htmlFor="sort_order">Порядок сортировки</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Ссылка</TableHead>
                <TableHead className="w-24">Активен</TableHead>
                <TableHead className="w-32">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clips.map((clip, index) => (
                <TableRow key={clip.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>{clip.title || "—"}</TableCell>
                  <TableCell>
                    <a
                      href={clip.vk_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Открыть
                    </a>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={clip.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({
                          id: clip.id,
                          is_active: checked,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(clip)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Удалить этот клип?")) {
                            deleteMutation.mutate(clip.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
