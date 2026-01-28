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

interface FeaturedCategory {
  id: string;
  category_id: string;
  custom_image_url: string | null;
  custom_title: string | null;
  sort_order: number;
  is_active: boolean;
}

export function CategoriesSection() {
  // First try to get manually configured featured categories
  const { data: featuredCategories, isLoading: loadingFeatured } = useQuery({
    queryKey: ["home-featured-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_categories")
        .select(`
          *,
          category:categories(id, name, slug, image_url)
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as (FeaturedCategory & { category: { id: string; name: string; slug: string; image_url: string | null } })[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fallback: fetch categories automatically if no featured configured
  const { data: autoCategories, isLoading: loadingAuto } = useQuery({
    queryKey: ["home-categories-auto"],
    queryFn: async () => {
      // Query 1: categories
      const { data: cats, error: catsError } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, sort_order")
        .order("sort_order", { ascending: true });

      if (catsError) throw catsError;
      if (!cats || cats.length === 0) return [];

      // Query 2: product_categories -> products -> images (single query)
      const { data: productCategories, error: pcError } = await supabase
        .from("product_categories")
        .select(
          `
          category_id,
          products!inner (
            id,
            is_active,
            sort_order,
            product_images (url, is_main, sort_order)
          )
        `
        )
        .in(
          "category_id",
          cats.map((c) => c.id)
        );

      if (pcError) throw pcError;

      const byCategory = new Map<
        string,
        {
          productCount: number;
          bestImageUrl: string | null;
          bestImageScore: number;
        }
      >();

      const scoreImage = (p: any, img: any, categoryId: string) => {
        const categoryHash = categoryId.charCodeAt(0) + categoryId.charCodeAt(categoryId.length - 1);
        const mainBonus = img?.is_main ? 10_000 : 0;
        const imgOrder = typeof img?.sort_order === "number" ? 1_000 - img.sort_order : 0;
        const productOrder = typeof p?.sort_order === "number" ? 100 - p.sort_order : 0;
        const varietyBonus = (categoryHash % 5) * 500;
        return mainBonus + imgOrder + productOrder + varietyBonus;
      };

      if (productCategories) {
        for (const pc of productCategories as any[]) {
          const product = pc.products;
          if (!product?.is_active) continue;

          const existing = byCategory.get(pc.category_id) || {
            productCount: 0,
            bestImageUrl: null,
            bestImageScore: -1,
          };

          existing.productCount += 1;

          const images = product.product_images || [];
          for (const img of images) {
            const url = img?.url;
            if (!url) continue;
            const s = scoreImage(product, img, pc.category_id);
            if (s > existing.bestImageScore) {
              existing.bestImageScore = s;
              existing.bestImageUrl = url;
            }
          }

          byCategory.set(pc.category_id, existing);
        }
      }

      return cats
        .map((cat) => {
          const meta = byCategory.get(cat.id);
          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            imageUrl: cat.image_url || meta?.bestImageUrl || null,
            productCount: meta?.productCount ?? 0,
          };
        })
        .filter((c) => c.productCount > 0)
        .slice(0, 8);
    },
    staleTime: 5 * 60 * 1000,
    // Only run if no featured categories
    enabled: !loadingFeatured && (!featuredCategories || featuredCategories.length === 0),
  });

  const isLoading = loadingFeatured || (loadingAuto && (!featuredCategories || featuredCategories.length === 0));

  // Use featured if available, otherwise auto
  const useFeatured = featuredCategories && featuredCategories.length > 0;
  const categories = useFeatured
    ? featuredCategories.map((fc) => ({
        id: fc.category?.id || fc.category_id,
        name: fc.custom_title || fc.category?.name || "Категория",
        slug: fc.category?.slug || "",
        imageUrl: fc.custom_image_url || fc.category?.image_url || null,
      }))
    : autoCategories || [];

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
