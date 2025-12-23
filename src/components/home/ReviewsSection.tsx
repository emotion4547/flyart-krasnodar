import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  text: string;
  source: string | null;
}

export function ReviewsSection() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, author_name, author_avatar, rating, text, source')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data as Review[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Don't render section if no reviews
  if (!isLoading && (!reviews || reviews.length === 0)) {
    return null;
  }

  return (
    <section className="section-padding bg-warm-cream">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Отзывы наших клиентов
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Нам доверяют сотни семей Красноярска — читайте реальные отзывы
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-28 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            reviews?.map((review, index) => (
              <article
                key={review.id}
                className="relative p-6 rounded-2xl bg-card border border-border/50 hover:border-tiffany/30 transition-all duration-300 hover:shadow-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 h-8 w-8 text-tiffany-light" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  {review.author_avatar ? (
                    <img
                      src={review.author_avatar}
                      alt={review.author_name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-tiffany-light"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-tiffany-light ring-2 ring-tiffany-light flex items-center justify-center">
                      <span className="text-tiffany-dark font-semibold text-lg">
                        {review.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground">{review.author_name}</h4>
                    {review.source && (
                      <p className="text-xs text-muted-foreground">{review.source}</p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                  {review.text}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
