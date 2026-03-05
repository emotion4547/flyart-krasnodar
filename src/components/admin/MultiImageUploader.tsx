import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Loader2, Link as LinkIcon, Star, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { compressImage } from '@/lib/imageCompression';

export interface ProductImage {
  id: string;
  url: string;
  is_main: boolean;
  sort_order: number;
}

interface MultiImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
}

interface SortableImageProps {
  image: ProductImage;
  onRemove: (id: string) => void;
  onSetMain: (id: string) => void;
}

function SortableImage({ image, onRemove, onSetMain }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group rounded-lg overflow-hidden border-2 bg-muted aspect-square',
        image.is_main ? 'border-gold ring-2 ring-gold/30' : 'border-border',
        isDragging && 'opacity-50'
      )}
    >
      <img
        src={image.url}
        alt="Product"
        className="w-full h-full object-cover"
      />
      
      {/* Main badge */}
      {image.is_main && (
        <div className="absolute top-1 left-1 bg-gold text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
          Главное
        </div>
      )}

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 p-1 bg-black/50 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
        {!image.is_main && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-white hover:bg-white/20"
            onClick={() => onSetMain(image.id)}
          >
            <Star className="h-3 w-3 mr-1" />
            Главное
          </Button>
        )}
        {image.is_main && <div />}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-white hover:bg-destructive/80 hover:text-white"
          onClick={() => onRemove(image.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function MultiImageUploader({
  images,
  onChange,
  folder = 'products',
  label = 'Изображения товара',
  maxImages = 10,
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
        ...img,
        sort_order: idx,
      }));
      onChange(newImages);
    }
  }, [images, onChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      toast.error(`Можно добавить ещё ${remaining} изображений`);
      return;
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите только изображения');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Максимальный размер файла 5 МБ');
        return;
      }
    }

    setIsUploading(true);

    try {
      const newImages: ProductImage[] = [];

      for (const file of files) {
        const compressed = await compressImage(file);
        const ext = compressed.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('catalog-images')
          .upload(fileName, compressed, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('catalog-images')
          .getPublicUrl(fileName);

        newImages.push({
          id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          url: data.publicUrl,
          is_main: images.length === 0 && newImages.length === 0,
          sort_order: images.length + newImages.length,
        });
      }

      onChange([...images, ...newImages]);
      toast.success(`Загружено ${newImages.length} изображений`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    if (images.length >= maxImages) {
      toast.error(`Максимум ${maxImages} изображений`);
      return;
    }

    const newImage: ProductImage = {
      id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      url: urlInput.trim(),
      is_main: images.length === 0,
      sort_order: images.length,
    };

    onChange([...images, newImage]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemove = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
    // If we removed the main image, set the first one as main
    if (newImages.length > 0 && !newImages.some((img) => img.is_main)) {
      newImages[0].is_main = true;
    }
    // Update sort_order
    onChange(newImages.map((img, idx) => ({ ...img, sort_order: idx })));
  };

  const handleSetMain = (id: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        is_main: img.id === id,
      }))
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      </div>

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onRemove={handleRemove}
                  onSetMain={handleSetMain}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length < maxImages && (
        <>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 bg-muted/50 hover:bg-muted transition-colors cursor-pointer h-24',
              isUploading && 'pointer-events-none'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Нажмите или перетащите файлы
                </span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Загрузить
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </Button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button type="button" size="sm" onClick={handleUrlSubmit}>
                Добавить
              </Button>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Перетаскивайте изображения для изменения порядка. Нажмите "Главное" для выбора основного изображения каталога.
      </p>
    </div>
  );
}
