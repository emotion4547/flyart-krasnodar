import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const touchStartRef = useRef<number>(0);
  const touchScrollRef = useRef<number>(0);

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
  });

  // Calculate total width of one set of clips
  const clipWidth = isMobile ? 160 : 180;
  const gap = 16;
  const totalWidth = clips.length * (clipWidth + gap);

  // Speed: pixels per second (slower on mobile)
  const speed = isMobile ? 30 : 50;

  const animate = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (!isPaused && totalWidth > 0) {
      setScrollPosition((prev) => {
        const newPos = prev + (speed * deltaTime) / 1000;
        // Reset when we've scrolled past one full set
        return newPos >= totalWidth ? newPos - totalWidth : newPos;
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused, totalWidth, speed]);

  useEffect(() => {
    if (clips.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, clips.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartRef.current = e.touches[0].clientX;
    touchScrollRef.current = scrollPosition;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchDelta = touchStartRef.current - e.touches[0].clientX;
    let newPos = touchScrollRef.current + touchDelta;
    
    // Keep within bounds
    if (newPos < 0) newPos = totalWidth + newPos;
    if (newPos >= totalWidth) newPos = newPos - totalWidth;
    
    setScrollPosition(newPos);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    lastTimeRef.current = 0;
  };

  if (isLoading || clips.length === 0) {
    return null;
  }

  // Duplicate clips for seamless loop
  const duplicatedClips = [...clips, ...clips, ...clips];

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
          ref={containerRef}
          className="relative overflow-hidden rounded-xl touch-pan-x"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => { setIsPaused(false); lastTimeRef.current = 0; }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div
            className="flex gap-4 will-change-transform"
            style={{
              transform: `translateX(-${scrollPosition}px)`,
              width: 'fit-content',
            }}
          >
            {duplicatedClips.map((clip, index) => (
              <a
                key={`${clip.id}-${index}`}
                href={clip.vk_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex-shrink-0 w-[160px] md:w-[180px] aspect-[9/16] bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <iframe
                  src={getVKEmbedUrl(clip.vk_url) || ""}
                  className="w-full h-full pointer-events-none"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
