import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/home/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { ArrowLeft } from "lucide-react";

interface CollectionProduct {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  price_old: number | null;
  is_hit: boolean | null;
  is_new: boolean | null;
  is_sale: boolean | null;
  product_images: { url: string; alt_text: string | null; is_main: boolean | null }[];
}

const Collection = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch collection
  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch collection items and products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["collection-products", collection?.id],
    queryFn: async () => {
      if (!collection?.id) return [];

      // Get collection items
      const { data: items, error: itemsError } = await supabase
        .from("collection_items")
        .select("product_id, category_id")
        .eq("collection_id", collection.id)
        .order("sort_order", { ascending: true });

      if (itemsError) throw itemsError;

      const productIds = items
        .filter((item) => item.product_id)
        .map((item) => item.product_id);
      
      const categoryIds = items
        .filter((item) => item.category_id)
        .map((item) => item.category_id);

      // Fetch products directly added
      let directProducts: CollectionProduct[] = [];
      if (productIds.length > 0) {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id, title, slug, sku, price, price_old, is_hit, is_new, is_sale,
            product_images (url, alt_text, is_main)
          `)
          .eq("is_active", true)
          .in("id", productIds);

        if (error) throw error;
        directProducts = (data || []) as CollectionProduct[];
      }

      // Fetch products from categories
      let categoryProducts: CollectionProduct[] = [];
      if (categoryIds.length > 0) {
        const { data: productCategories, error: pcError } = await supabase
          .from("product_categories")
          .select("product_id")
          .in("category_id", categoryIds);

        if (pcError) throw pcError;

        const categoryProductIds = productCategories
          .map((pc) => pc.product_id)
          .filter((id) => !productIds.includes(id)); // Avoid duplicates

        if (categoryProductIds.length > 0) {
          const { data, error } = await supabase
            .from("products")
            .select(`
              id, title, slug, sku, price, price_old, is_hit, is_new, is_sale,
              product_images (url, alt_text, is_main)
            `)
            .eq("is_active", true)
            .in("id", categoryProductIds);

          if (error) throw error;
          categoryProducts = (data || []) as CollectionProduct[];
        }
      }

      // Merge and deduplicate
      const allProducts = [...directProducts, ...categoryProducts];
      const uniqueProducts = allProducts.reduce((acc, product) => {
        if (!acc.find((p) => p.id === product.id)) {
          acc.push(product);
        }
        return acc;
      }, [] as CollectionProduct[]);

      return uniqueProducts;
    },
    enabled: !!collection?.id,
  });

  const isLoading = collectionLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-warm-cream">
          <div className="container-custom py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-48 w-full rounded-2xl mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-warm-cream section-padding">
          <div className="container-custom text-center py-16">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Подборка не найдена
            </h1>
            <p className="text-muted-foreground mb-8">
              Возможно, она была удалена или временно недоступна
            </p>
            <Link to="/">
              <Button variant="cta">На главную</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Подборки", href: "/" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={collection.name}
        description={collection.description || `Подборка товаров "${collection.name}"`}
      />
      <Header />
      <main className="flex-1 bg-warm-cream">
        {/* Hero Banner */}
        <div 
          className="relative h-48 md:h-64 bg-cover bg-center"
          style={{ 
            backgroundImage: collection.image_url 
              ? `url(${collection.image_url})` 
              : 'linear-gradient(135deg, hsl(var(--tiffany)) 0%, hsl(var(--tiffany-dark)) 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="container-custom relative z-10 h-full flex flex-col justify-end pb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-white/80 mt-2 max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <div className="container-custom py-8">
          <Breadcrumbs items={breadcrumbItems} currentPage={collection.name} />

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
              {products.map((product, index) => {
                const mainImage = product.product_images?.find((img) => img.is_main) || product.product_images?.[0];
                return (
                  <div
                    key={product.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
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
              <p className="text-muted-foreground text-lg">
                В этой подборке пока нет товаров
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
