import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export function useSettings<T>(key: string, defaultValue: T) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      
      if (error) throw error;
      return (data?.value as T) ?? defaultValue;
    },
  });

  const mutation = useMutation({
    mutationFn: async (value: T) => {
      // First try to update existing record
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      const jsonValue = value as unknown as Json;

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ value: jsonValue })
          .eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([{ key, value: jsonValue }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', key] });
      toast.success('Настройки сохранены');
    },
    onError: () => {
      toast.error('Ошибка при сохранении настроек');
    },
  });

  return {
    data: data ?? defaultValue,
    isLoading,
    save: mutation.mutate,
    isSaving: mutation.isPending,
  };
}

export function usePageSeo(pageId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pages_seo', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages_seo')
        .select('*')
        .eq('page_id', pageId)
        .maybeSingle();
      
      if (error) throw error;
      return data ?? {
        title: '',
        description: '',
        keywords: '',
        h1: '',
        og_title: '',
        og_description: '',
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async (value: {
      title: string;
      description: string;
      keywords: string;
      h1: string;
      og_title: string;
      og_description: string;
    }) => {
      const { data: existing } = await supabase
        .from('pages_seo')
        .select('id')
        .eq('page_id', pageId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('pages_seo')
          .update(value)
          .eq('page_id', pageId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pages_seo')
          .insert([{ page_id: pageId, ...value }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages_seo', pageId] });
      toast.success('SEO настройки сохранены');
    },
    onError: () => {
      toast.error('Ошибка при сохранении SEO настроек');
    },
  });

  return {
    data: data ?? {
      title: '',
      description: '',
      keywords: '',
      h1: '',
      og_title: '',
      og_description: '',
    },
    isLoading,
    save: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
