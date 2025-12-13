import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// Color palette for categories
const categoryColors = [
  "from-pink-200 to-peach",
  "from-blue-200 to-tiffany-light",
  "from-peach to-pink-100",
  "from-slate-200 to-tiffany-light",
  "from-tiffany-light to-blue-100",
  "from-pink-100 via-purple-100 to-blue-100",
  "from-gold-light to-peach",
  "from-tiffany-light to-gold-light",
];

export function CategoriesSection() {
  // Optimized: Fetch categories with product images in 2 queries instead of N+1
  const { data: categories, isLoading } = useQuery({
    queryKey: ["home-categories-optimized"],
    queryFn: async () => {
      // Query 1: Get all categories
      const { data: cats, error: catsError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });

      if (catsError) throw catsError;
      if (!cats || cats.length === 0) return [];

      // Query 2: Get all product_categories with product images in one query
      const { data: productCategories, error: pcError } = await supabase
        .from("product_categories")
        .select(`
          category_id,
          products!inner (
            id,
            is_active,
            product_images (url, is_main)
          )
        `)
        .in("category_id", cats.map(c => c.id));

      if (pcError) throw pcError;

      // Group by category and find first image for each
      const categoryImageMap = new Map<string, { imageUrl: string; productCount: number }>();
      
      if (productCategories) {
        for (const pc of productCategories) {
          const product = pc.products as any;
          if (!product?.is_active) continue;
          
          const existing = categoryImageMap.get(pc.category_id);
          const currentCount = existing?.productCount || 0;
          
          // Only set image if we don't have one yet
          if (!existing?.imageUrl && product?.product_images?.length > 0) {
            const mainImg = product.product_images.find((img: any) => img.is_main);
            const imageUrl = mainImg?.url || product.product_images[0]?.url;
            categoryImageMap.set(pc.category_id, { 
              imageUrl, 
              productCount: currentCount + 1 
            });
          } else {
            categoryImageMap.set(pc.category_id, { 
              imageUrl: existing?.imageUrl || '', 
              productCount: currentCount + 1 
            });
          }
        }
      }

      // Combine categories with their images
      const categoriesWithImages = cats
        .map(cat => ({
          ...cat,
          imageUrl: categoryImageMap.get(cat.id)?.imageUrl || null,
          productCount: categoryImageMap.get(cat.id)?.productCount || 0,
        }))
        .filter(c => c.productCount > 0 && c.imageUrl)
        .slice(0, 8);

      return categoriesWithImages;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <section className="section-padding bg-background relative z-10">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Популярные разделы
            </h2>
            <div className="gold-line max-w-xs mx-auto mb-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-background relative z-10">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Популярные разделы
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Выберите категорию шаров для любого праздника и повода
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/catalog?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-square transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              {/* Background gradient fallback */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]}`}
              />

              {/* Product image - full size */}
              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              {/* Category name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-sm md:text-base text-center drop-shadow-lg">
                  {category.name}
                </h3>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-tiffany/0 group-hover:bg-tiffany/10 transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
