import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface VKClip {
  id: string;
  title: string | null;
  vk_url: string;
  sort_order: number;
}

// Extract clip ID from VK URL like https://vk.com/clip-206638918_456239179
const getVKEmbedUrl = (url: string) => {
  const match = url.match(/clip(-?\d+_\d+)/);
  if (match) {
    return `https://vk.com/video_ext.php?oid=${match[1].split('_')[0]}&id=${match[1].split('_')[1]}&hd=2`;
  }
  return null;
};

export const VKClipsSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

  // Check if section is enabled
  const { data: sectionSettings } = useQuery({
    queryKey: ["settings", "vk_clips_section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "vk_clips_section")
        .maybeSingle();
      if (error) throw error;
      return (data?.value as { enabled: boolean }) ?? { enabled: true };
    },
  });

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["vk-clips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vk_clips")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as VKClip[];
    },
    // Don't fetch clips if section is disabled
    enabled: sectionSettings?.enabled !== false,
  });

  // Calculate animation duration based on number of clips (slower = smoother on mobile)
  const animationDuration = useMemo(() => {
    const clipWidth = isMobile ? 160 : 180;
    const gap = 16;
    const totalWidth = clips.length * (clipWidth + gap);
    // Pixels per second: slower on mobile for better performance
    const speed = isMobile ? 25 : 40;
    return totalWidth / speed;
  }, [clips.length, isMobile]);

  // Return null if section is disabled, loading, or no clips
  if (sectionSettings?.enabled === false || isLoading || clips.length === 0) {
    return null;
  }

  // Only duplicate once for seamless loop (reduces iframe count)
  const duplicatedClips = [...clips, ...clips];

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Play className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">VK Клипы</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Смотрите наши работы
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Видео с нашими композициями и закулисьем
          </p>
        </div>
      </div>

      {/* Carousel container */}
      <div className="container mx-auto px-4">
        <div 
          className="relative overflow-hidden rounded-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track with CSS animation */}
          <div
            className="flex gap-4"
            style={{
              width: 'fit-content',
              animation: `vk-scroll ${animationDuration}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {duplicatedClips.map((clip, index) => (
              <ClipCard key={`${clip.id}-${index}`} clip={clip} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </div>

      {/* CSS animation keyframes */}
      <style>{`
        @keyframes vk-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

// Separate component for lazy loading
const ClipCard = ({ clip, isMobile }: { clip: VKClip; isMobile: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  const embedUrl = getVKEmbedUrl(clip.vk_url);

  return (
    <a
      href={clip.vk_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex-shrink-0 aspect-[9/16] bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300"
      style={{ width: isMobile ? 160 : 180 }}
      onMouseEnter={() => setIsVisible(true)}
      onTouchStart={() => setIsVisible(true)}
    >
      {/* Placeholder until hover/touch */}
      {!isVisible ? (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : embedUrl && !hasError ? (
        <iframe
          src={embedUrl}
          className="w-full h-full pointer-events-none"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-3 left-3 right-3">
          {clip.title && (
            <p className="text-white text-sm font-medium truncate">
              {clip.title}
            </p>
          )}
          <p className="text-white/70 text-xs">Смотреть в VK →</p>
        </div>
      </div>
    </a>
  );
};
