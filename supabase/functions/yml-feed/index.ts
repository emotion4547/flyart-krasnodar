import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const siteUrl = url.searchParams.get("siteUrl") || "https://flyart-krasnodar.lovable.app";

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("sort_order", { ascending: true });

    if (catError) throw catError;

    // Fetch active products with images
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, title, slug, description, price, price_old, quantity, is_active, sku")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (prodError) throw prodError;

    // Fetch product images
    const { data: images, error: imgError } = await supabase
      .from("product_images")
      .select("product_id, url, is_main, sort_order")
      .order("sort_order", { ascending: true });

    if (imgError) throw imgError;

    // Fetch product-category mappings
    const { data: productCategories, error: pcError } = await supabase
      .from("product_categories")
      .select("product_id, category_id");

    if (pcError) throw pcError;

    // Build image map: product_id -> urls[]
    const imageMap = new Map<string, string[]>();
    for (const img of images || []) {
      if (!imageMap.has(img.product_id)) {
        imageMap.set(img.product_id, []);
      }
      imageMap.get(img.product_id)!.push(img.url);
    }

    // Build product->category map (first category)
    const prodCatMap = new Map<string, string>();
    for (const pc of productCategories || []) {
      if (!prodCatMap.has(pc.product_id)) {
        prodCatMap.set(pc.product_id, pc.category_id);
      }
    }

    // Build category index map for numeric IDs
    const catIndexMap = new Map<string, number>();
    (categories || []).forEach((cat, i) => {
      catIndexMap.set(cat.id, i + 1);
    });

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<yml_catalog date="${dateStr}">\n`;
    xml += `  <shop>\n`;
    xml += `    <name>FlyArt</name>\n`;
    xml += `    <company>FlyArt</company>\n`;
    xml += `    <url>${escapeXml(siteUrl)}</url>\n`;

    // Currencies
    xml += `    <currencies>\n`;
    xml += `      <currency id="RUB" rate="1"/>\n`;
    xml += `    </currencies>\n`;

    // Categories
    xml += `    <categories>\n`;
    for (const cat of categories || []) {
      const catId = catIndexMap.get(cat.id)!;
      const parentAttr = cat.parent_id && catIndexMap.has(cat.parent_id)
        ? ` parentId="${catIndexMap.get(cat.parent_id)}"`
        : "";
      xml += `      <category id="${catId}"${parentAttr}>${escapeXml(cat.name)}</category>\n`;
    }
    xml += `    </categories>\n`;

    // Offers
    xml += `    <offers>\n`;
    for (const product of products || []) {
      const available = (product.quantity ?? 0) > 0;
      const categoryId = prodCatMap.get(product.id);
      const numericCatId = categoryId ? catIndexMap.get(categoryId) : undefined;

      xml += `      <offer id="${escapeXml(product.sku)}" available="${available}">\n`;
      xml += `        <url>${escapeXml(siteUrl)}/product/${escapeXml(product.slug)}</url>\n`;
      xml += `        <price>${product.price}</price>\n`;
      if (product.price_old && product.price_old > product.price) {
        xml += `        <oldprice>${product.price_old}</oldprice>\n`;
      }
      xml += `        <currencyId>RUB</currencyId>\n`;
      if (numericCatId) {
        xml += `        <categoryId>${numericCatId}</categoryId>\n`;
      }

      // Pictures (max 10)
      const pics = imageMap.get(product.id) || [];
      for (const pic of pics.slice(0, 10)) {
        xml += `        <picture>${escapeXml(pic)}</picture>\n`;
      }

      xml += `        <name>${escapeXml(product.title)}</name>\n`;

      if (product.description) {
        // Strip HTML tags and limit to 3000 chars
        const cleanDesc = product.description.replace(/<[^>]*>/g, "").slice(0, 3000);
        xml += `        <description>${escapeXml(cleanDesc)}</description>\n`;
      }

      xml += `        <delivery>true</delivery>\n`;
      xml += `        <store>false</store>\n`;
      xml += `        <pickup>false</pickup>\n`;

      xml += `      </offer>\n`;
    }
    xml += `    </offers>\n`;

    xml += `  </shop>\n`;
    xml += `</yml_catalog>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": 'attachment; filename="yandex-feed.yml"',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating YML feed:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
