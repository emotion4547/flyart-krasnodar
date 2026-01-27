import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Video, Upload, Loader2, Play, Trash2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface HeroVideoSettings {
  url: string;
  fallback: string;
}

const defaultSettings: HeroVideoSettings = {
  url: '',
  fallback: '/videos/hero-balloons.mp4',
};

export default function HeroVideoSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, save, isSaving } = useSettings<HeroVideoSettings>('hero_video', defaultSettings);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Выберите видео файл');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 50MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('hero-videos')
        .getPublicUrl(fileName);

      const newSettings = {
        url: urlData.publicUrl,
        fallback: data?.fallback || defaultSettings.fallback,
      };

      await save(newSettings);
      toast.success('Видео загружено');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Ошибка при загрузке видео: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = async () => {
    if (!confirm('Удалить текущее видео?')) return;

    try {
      const newSettings = {
        url: '',
        fallback: data?.fallback || defaultSettings.fallback,
      };
      await save(newSettings);
      toast.success('Видео удалено');
    } catch (error) {
      toast.error('Ошибка при удалении видео');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const videoUrl = data?.url || data?.fallback || defaultSettings.fallback;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Фоновое видео Hero-блока
          </CardTitle>
          <CardDescription>
            Видео отображается на главной странице в качестве фона Hero-блока
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current video preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Текущее видео</p>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
              <video
                key={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
              {data?.url && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveVideo}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              )}
              {!data?.url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <p className="text-white text-sm">Используется стандартное видео</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload new video */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Загрузить новое видео</p>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isUploading ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                  <p className="font-medium">Загрузка видео...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Нажмите для выбора видео</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    MP4 или WebM, до 50MB
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Рекомендации</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Оптимальный формат: MP4 с кодеком H.264</li>
            <li>Рекомендуемое разрешение: 1920x1080 или выше</li>
            <li>Длительность: 10-30 секунд (видео зациклено)</li>
            <li>Размер файла: до 50MB для быстрой загрузки</li>
            <li>Контент: яркие, динамичные кадры с шарами</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
