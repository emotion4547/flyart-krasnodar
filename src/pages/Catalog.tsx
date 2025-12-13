import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRODUCTS_PER_PAGE = 24;

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("sort_order");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

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
      let filtered = data;
      if (selectedCategory) {
        filtered = filtered.filter((product) =>
          product.product_categories?.some(
            (pc) => pc.category_id === selectedCategory
          )
        );
      }

      return filtered;
    },
  });

  // Apply price filter on filtered products
  const filteredProducts = products?.filter((product) => {
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    if (min !== null && product.price < min) return false;
    if (max !== null && product.price > max) return false;
    return true;
  });

  const PriceFilter = () => (
    <div className="space-y-3 mt-6 pt-6 border-t border-border/50">
      <Label className="text-sm font-medium">Цена, ₽</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="от"
          value={priceMin}
          onChange={(e) => {
            setPriceMin(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full"
        />
        <Input
          type="number"
          placeholder="до"
          value={priceMax}
          onChange={(e) => {
            setPriceMax(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full"
        />
      </div>
      {(priceMin || priceMax) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => {
            setPriceMin("");
            setPriceMax("");
            setCurrentPage(1);
          }}
        >
          <X className="h-3 w-3 mr-1" />
          Сбросить цену
        </Button>
      )}
    </div>
  );

  const CategoryFilters = () => (
    <div className="space-y-2">
      <Button
        variant={selectedCategory === null ? "tiffany" : "ghost"}
        className="w-full justify-start text-left whitespace-normal h-auto py-2"
        onClick={() => {
          setSelectedCategory(null);
          setCurrentPage(1);
        }}
      >
        Все товары
      </Button>
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "tiffany" : "ghost"}
          className="w-full justify-start text-left whitespace-normal h-auto py-2"
          onClick={() => {
            setSelectedCategory(category.id);
            setCurrentPage(1);
          }}
        >
          {category.name}
        </Button>
      ))}
      <PriceFilter />
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
                {filteredProducts?.length || 0} товаров
                {filteredProducts && filteredProducts.length > PRODUCTS_PER_PAGE && (
                  <span className="ml-2">
                    (страница {currentPage} из {Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)})
                  </span>
                )}
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
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
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
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts
                      .slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
                      .map((product, index) => {
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

                  {/* Pagination */}
                  {filteredProducts.length > PRODUCTS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) }).map(
                        (_, i) => {
                          const page = i + 1;
                          const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
                          
                          // Show first, last, current, and adjacent pages
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "tiffany" : "outline"}
                                size="icon"
                                onClick={() => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                              >
                                {page}
                              </Button>
                            );
                          }

                          // Show ellipsis
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            );
                          }

                          return null;
                        }
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCurrentPage((p) =>
                            Math.min(Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE), p + 1)
                          );
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
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
