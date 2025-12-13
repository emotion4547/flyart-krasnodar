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
  // Fetch categories with product images
  const { data: categories, isLoading } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      // Get categories with product count > 0
      const { data: cats, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Get a random product image for each category
      const categoriesWithImages = await Promise.all(
        cats.map(async (cat) => {
          // Get products in this category with images
          const { data: products } = await supabase
            .from("product_categories")
            .select(`
              product_id,
              products!inner (
                id,
                is_active,
                product_images (url, is_main)
              )
            `)
            .eq("category_id", cat.id)
            .limit(10);

          // Find a product with an image
          let imageUrl: string | null = null;
          if (products) {
            for (const pc of products) {
              const product = pc.products as any;
              if (product?.is_active && product?.product_images?.length > 0) {
                const mainImg = product.product_images.find((img: any) => img.is_main);
                imageUrl = mainImg?.url || product.product_images[0]?.url;
                break;
              }
            }
          }

          return {
            ...cat,
            imageUrl,
            productCount: products?.length || 0,
          };
        })
      );

      // Filter to show only categories with at least one product with image
      // and limit to 8 most populated
      return categoriesWithImages
        .filter((c) => c.productCount > 0 && c.imageUrl)
        .slice(0, 8);
    },
  });

  if (isLoading) {
    return (
      <section className="section-padding bg-background">
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

  return (
    <section className="section-padding bg-background">
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
          {categories?.map((category, index) => (
            <Link
              key={category.id}
              to={`/catalog?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-square transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} transition-transform duration-300 group-hover:scale-105`}
              />

              {/* Product image */}
              {category.imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-3/4 h-3/4 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              )}

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Category name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-sm md:text-base text-center drop-shadow-md">
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
