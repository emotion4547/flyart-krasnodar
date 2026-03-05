import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, ExternalLink } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import type { Partner } from '@/hooks/usePartners';

const empty: Omit<Partner, 'id' | 'created_at' | 'updated_at'> = {
  name: '', slug: '', logo_url: null, description: null,
  benefit_short: '', benefit_detail: null, website_url: null,
  promo_code: null, discount_value: null, is_active: true, sort_order: 0,
};

export default function PartnersManager() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState(empty);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners' as any)
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as Partner[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name || !form.slug || !form.benefit_short) throw new Error('Заполните обязательные поля');
      const payload = { ...form };
      if (editing) {
        const { error } = await (supabase.from('partners' as any) as any).update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('partners' as any) as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-partners'] });
      qc.invalidateQueries({ queryKey: ['partners'] });
      toast.success(editing ? 'Партнёр обновлён' : 'Партнёр создан');
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('partners' as any) as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-partners'] });
      qc.invalidateQueries({ queryKey: ['partners'] });
      toast.success('Партнёр удалён');
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await (supabase.from('partners' as any) as any).update({ is_active: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-partners'] });
      qc.invalidateQueries({ queryKey: ['partners'] });
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  }

  function openEdit(p: Partner) {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, logo_url: p.logo_url,
      description: p.description, benefit_short: p.benefit_short,
      benefit_detail: p.benefit_detail, website_url: p.website_url,
      promo_code: p.promo_code, discount_value: p.discount_value,
      is_active: p.is_active, sort_order: p.sort_order,
    });
    setOpen(true);
  }

  function closeDialog() { setOpen(false); setEditing(null); }

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-zа-яё0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Партнёры</h2>
          <p className="text-sm text-muted-foreground">Управление партнёрскими бонусами</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : partners.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Партнёров пока нет</p>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="h-12 w-12 object-contain rounded-lg bg-muted p-1" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {p.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <Badge variant={p.is_active ? 'default' : 'secondary'}>
                      {p.is_active ? 'Активен' : 'Скрыт'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {p.discount_value && `${p.discount_value} · `}{p.benefit_short}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggle.mutate({ id: p.id, val: !p.is_active })}>
                    {p.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove.mutate(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать партнёра' : 'Новый партнёр'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input value={form.name} onChange={e => { set('name', e.target.value); if (!editing) set('slug', slugify(e.target.value)); }} />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e => set('slug', e.target.value)} />
            </div>
            <div>
              <Label>Логотип</Label>
              <ImageUploader
                value={form.logo_url || ''}
                onChange={(url) => set('logo_url', url)}
                folder="partners"
              />
            </div>
            <div>
              <Label>Краткая выгода * (например «Скидка 10% на торты»)</Label>
              <Input value={form.benefit_short} onChange={e => set('benefit_short', e.target.value)} />
            </div>
            <div>
              <Label>Размер скидки (например «10%», «500₽»)</Label>
              <Input value={form.discount_value || ''} onChange={e => set('discount_value', e.target.value || null)} />
            </div>
            <div>
              <Label>Подробное описание</Label>
              <Textarea value={form.benefit_detail || ''} onChange={e => set('benefit_detail', e.target.value || null)} rows={3} />
            </div>
            <div>
              <Label>Описание компании</Label>
              <Textarea value={form.description || ''} onChange={e => set('description', e.target.value || null)} rows={2} />
            </div>
            <div>
              <Label>Сайт партнёра</Label>
              <Input value={form.website_url || ''} onChange={e => set('website_url', e.target.value || null)} placeholder="https://" />
            </div>
            <div>
              <Label>Промокод (показывается после покупки)</Label>
              <Input value={form.promo_code || ''} onChange={e => set('promo_code', e.target.value || null)} />
            </div>
            <div>
              <Label>Порядок сортировки</Label>
              <Input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
              <Label>Активен</Label>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full">
              {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
