import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export function CollectionsSection() {
  const { data: collections, isLoading } = useQuery({
    queryKey: ["active-collections"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, description, image_url")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as Collection[];
    },
  });

  // Don't render section if no collections
  if (!isLoading && (!collections || collections.length === 0)) {
    return null;
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            На повестке дня
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-64 h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 justify-center">
              {collections?.map((collection) => (
                <CarouselItem key={collection.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Link
                    to={`/collection/${collection.slug}`}
                    className="group block relative overflow-hidden rounded-2xl h-24 bg-card border border-border/50 hover:border-tiffany/50 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Background Image */}
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-tiffany/20 to-peach/20" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <h3 className="text-base font-bold text-white group-hover:text-tiffany-light transition-colors">
                        {collection.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs font-medium text-tiffany-light group-hover:gap-2 transition-all">
                        <span>Смотреть</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
