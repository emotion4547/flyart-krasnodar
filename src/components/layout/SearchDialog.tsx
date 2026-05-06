import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: { url: string; is_main: boolean }[];
}

interface SearchDialogProps {
  variant?: "icon" | "full" | "header";
}

export function SearchDialog({ variant = "icon" }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setProducts([]);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select(`
          id,
          title,
          slug,
          price,
          product_images (url, is_main)
        `)
        .eq("is_active", true)
        .ilike("title", `%${escapeILike(query)}%`)
        .limit(8);

      if (data) {
        setProducts(
          data.map((p) => ({
            ...p,
            images: p.product_images || [],
          }))
        );
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/product/${slug}`);
  };

  const getMainImage = (images: { url: string; is_main: boolean }[]) => {
    const main = images.find((img) => img.is_main);
    return main?.url || images[0]?.url || "/placeholder.svg";
  };

  return (
    <>
      {variant === "icon" ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="relative"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : variant === "header" ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full border border-border bg-muted/50 text-muted-foreground text-left hover:border-tiffany hover:bg-background transition-all group"
        >
          <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-tiffany transition-colors" />
          <span className="text-sm whitespace-nowrap">Искать воздушные шары...</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background text-muted-foreground text-left hover:border-tiffany transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>Поиск товаров...</span>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Поиск товаров..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Поиск...
            </div>
          )}
          {!loading && query.length >= 2 && products.length === 0 && (
            <CommandEmpty>Товары не найдены</CommandEmpty>
          )}
          {!loading && products.length > 0 && (
            <CommandGroup heading="Товары">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.title}
                  onSelect={() => handleSelect(product.slug)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={getMainImage(product.images)}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-sm text-tiffany font-semibold">
                      {product.price.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!loading && query.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Введите минимум 2 символа для поиска
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
