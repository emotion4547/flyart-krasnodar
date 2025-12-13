import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("sort_order");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["catalog-products", selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
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
          ),
          product_categories (
            category_id
          )
        `)
        .eq("is_active", true);

      // Sort
      if (sortBy === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_desc") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("sort_order", { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by category on client side (simpler for MVP)
      if (selectedCategory) {
        return data.filter((product) =>
          product.product_categories?.some(
            (pc) => pc.category_id === selectedCategory
          )
        );
      }

      return data;
    },
  });

  const CategoryFilters = () => (
    <div className="space-y-2">
      <Button
        variant={selectedCategory === null ? "tiffany" : "ghost"}
        className="w-full justify-start text-left whitespace-normal h-auto py-2"
        onClick={() => setSelectedCategory(null)}
      >
        Все товары
      </Button>
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "tiffany" : "ghost"}
          className="w-full justify-start text-left whitespace-normal h-auto py-2"
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 section-padding bg-warm-cream">
        <div className="container-custom">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Каталог
              </h1>
              <div className="gold-line max-w-xs mb-4" />
              <p className="text-muted-foreground">
                {products?.length || 0} товаров
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filters */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-background">
                  <div className="mt-8">
                    <h3 className="font-semibold text-foreground mb-4">Категории</h3>
                    <CategoryFilters />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-card">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sort_order">По умолчанию</SelectItem>
                  <SelectItem value="price_asc">Сначала дешевле</SelectItem>
                  <SelectItem value="price_desc">Сначала дороже</SelectItem>
                  <SelectItem value="newest">Сначала новые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block">
              <div className="bg-card rounded-2xl p-6 border border-border/50 sticky top-24">
                <h3 className="font-semibold text-foreground mb-4">Категории</h3>
                <CategoryFilters />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Active filter badge */}
              {selectedCategory && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Фильтр:</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => setSelectedCategory(null)}
                  >
                    {categories?.find((c) => c.id === selectedCategory)?.name}
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product, index) => {
                    const mainImage =
                      product.product_images?.find((img) => img.is_main) ||
                      product.product_images?.[0];
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
                  <p className="text-muted-foreground text-lg mb-4">
                    Товары не найдены
                  </p>
                  {selectedCategory && (
                    <Button
                      variant="tiffanyOutline"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Сбросить фильтр
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
