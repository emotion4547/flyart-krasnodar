import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Minus, Plus, Check, Truck, Shield, Gift, MapPin, CreditCard } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/SEO";
import { ProductSchema } from "@/components/ProductSchema";

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            url,
            alt_text,
            is_main,
            sort_order
          )
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch product category for breadcrumbs
  const { data: productCategory } = useQuery({
    queryKey: ["product-category", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select(`
          categories (
            id,
            name,
            slug
          )
        `)
        .eq("product_id", product!.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      // Return null if no category found (not an error)
      return data?.categories ?? null;
    },
    enabled: !!product?.id,
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .neq("id", product?.id)
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    const mainImage = product.product_images?.find((img) => img.is_main) || product.product_images?.[0];
    addItem(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        sku: product.sku,
        price: product.price,
        priceOld: product.price_old ?? undefined,
        image: mainImage?.url || "/placeholder.svg",
      },
      quantity
    );
    toast({
      title: "Добавлено в корзину",
      description: `${product.title} × ${quantity}`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 section-padding bg-warm-cream">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 section-padding bg-warm-cream">
          <div className="container-custom text-center py-16">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Товар не найден
            </h1>
            <p className="text-muted-foreground mb-8">
              Возможно, товар был удалён или временно недоступен
            </p>
            <Link to="/catalog">
              <Button variant="cta">Перейти в каталог</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.product_images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  const mainImage = images[selectedImage] || images[0];
  const discount = product.price_old ? Math.round((1 - product.price / product.price_old) * 100) : 0;

  const mainImageUrl = mainImage?.url || "/placeholder.svg";

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Каталог", href: "/catalog" },
    ...(productCategory ? [{
      label: productCategory.name,
      href: `/catalog?category=${productCategory.id}`
    }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={product.seo_title || product.title}
        description={product.seo_description || product.description || `Купить ${product.title} с доставкой в Красноярске`}
        keywords={product.seo_keywords || `${product.title}, воздушные шары, купить`}
        image={mainImageUrl}
        type="product"
      />
      <ProductSchema
        name={product.title}
        description={product.description || undefined}
        image={mainImageUrl}
        sku={product.sku}
        price={product.price}
        availability={product.quantity && product.quantity > 0 ? "InStock" : "OutOfStock"}
      />
      <Header />
      <main className="flex-1 bg-warm-cream">
        {/* Breadcrumbs */}
        <div className="container-custom pt-4">
          <Breadcrumbs items={breadcrumbItems} currentPage={product.title} />
        </div>

        <div className="container-custom pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border/50">
                <img
                  src={mainImage?.url || "/placeholder.svg"}
                  alt={mainImage?.alt_text || product.title}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-tiffany ring-2 ring-tiffany/20"
                          : "border-border/50 hover:border-tiffany/50"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt_text || `${product.title} - ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.is_hit && <span className="badge-hit">Хит</span>}
                {product.is_new && <span className="badge-new">Новинка</span>}
                {product.is_sale && discount > 0 && (
                  <span className="badge-sale">-{discount}%</span>
                )}
              </div>

              {/* SKU */}
              <p className="text-sm text-muted-foreground mb-2">Арт. {product.sku}</p>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {product.price.toLocaleString("ru-RU")} ₽
                </span>
                {product.price_old && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.price_old.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="gold-line mb-6" />

              {/* Quantity & Add to cart */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="cta" size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  В корзину — {(product.price * quantity).toLocaleString("ru-RU")} ₽
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-tiffany-light flex items-center justify-center">
                    <Truck className="h-5 w-5 text-tiffany-dark" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Доставка</p>
                    <p className="text-xs text-muted-foreground">от 2 часов</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-peach flex items-center justify-center">
                    <Shield className="h-5 w-5 text-cta" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Гарантия</p>
                    <p className="text-xs text-muted-foreground">качества</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-gold-light flex items-center justify-center">
                    <Gift className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Упаковка</p>
                    <p className="text-xs text-muted-foreground">в подарок</p>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-card rounded-2xl border border-border/50 p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-tiffany" />
                  <h3 className="font-semibold text-foreground">Доставка</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Свердловский р-он</span>
                    <span className="font-medium text-foreground">200 ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Центр</span>
                    <span className="font-medium text-foreground">300 ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Железнодорожный р-он</span>
                    <span className="font-medium text-foreground">400 ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Солнечный, Пашенный</span>
                    <span className="font-medium text-foreground">500 ₽</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/50 mt-3">
                    Время работы: с 09:00 до 22:00
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Самовывоз:</span> г. Красноярск, ул. Александра Матросова 30ст57, по предварительной договорённости.
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-tiffany" />
                  <h3 className="font-semibold text-foreground">Оплата</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Принимаем оплату переводом на карту в размере 30-100% от стоимости заказа.</p>
                  <p>
                    <span className="font-medium text-foreground">Способ оплаты:</span> Сделав заказ в нашем интернет-магазине, у оператора можно узнать номер карты для оплаты. Получатель — Татьяна Сергеевна.
                  </p>
                  <p className="text-xs">В комментариях к платежу ничего указывать не нужно!</p>
                </div>
              </div>

              {/* Full text */}
              {product.full_text && (
                <div className="mt-8">
                  <h3 className="font-semibold text-foreground mb-3">Подробное описание</h3>
                  <div className="prose prose-sm text-muted-foreground">
                    <p className="whitespace-pre-line">{product.full_text}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Вам может понравиться
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => {
                  const img = p.product_images?.find((i) => i.is_main) || p.product_images?.[0];
                  return (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      slug={p.slug}
                      title={p.title}
                      sku={p.sku}
                      price={p.price}
                      priceOld={p.price_old ?? undefined}
                      image={img?.url || "/placeholder.svg"}
                      isHit={p.is_hit ?? false}
                      isNew={p.is_new ?? false}
                      isSale={p.is_sale ?? false}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;
