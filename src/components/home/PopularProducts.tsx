import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function PopularProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["popular-products"],
    queryFn: async () => {
      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          id,
          title,
          sku,
          price,
          price_old,
          is_hit,
          is_new,
          is_sale,
          slug,
          product_images (
            url,
            alt_text,
            is_main
          )
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(8);

      if (error) throw error;
      return productsData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <section className="section-padding bg-warm-cream">
      <div className="container-custom">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Популярные композиции
            </h2>
            <div className="gold-line max-w-xs mb-4" />
            <p className="text-muted-foreground max-w-xl">
              Наши бестселлеры — проверенные временем наборы, которые всегда радуют
            </p>
          </div>
          <Link to="/catalog">
            <Button variant="tiffanyOutline" className="group">
              Все товары
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-product">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => {
              const mainImage = product.product_images?.find((img) => img.is_main) || product.product_images?.[0];
              return (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    sku={product.sku}
                    price={product.price}
                    priceOld={product.price_old ?? undefined}
                    image={mainImage?.url || "/placeholder.svg"}
                    isHit={product.is_hit ?? false}
                    isNew={product.is_new ?? false}
                    isSale={product.is_sale ?? false}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              Товары скоро появятся
            </p>
            <p className="text-muted-foreground text-sm">
              Следите за обновлениями каталога
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
