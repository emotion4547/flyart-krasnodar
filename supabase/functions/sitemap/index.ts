import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get site URL from request or use default
    const url = new URL(req.url);
    const siteUrl = url.searchParams.get("siteUrl") || "https://ко-шарик.рф";

    console.log("Generating sitemap for:", siteUrl);

    // Fetch all active products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
      throw productsError;
    }

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .order("updated_at", { ascending: false });

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      throw categoriesError;
    }

    console.log(`Found ${products?.length || 0} products and ${categories?.length || 0} categories`);

    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/catalog", priority: "0.9", changefreq: "daily" },
      { loc: "/delivery", priority: "0.7", changefreq: "monthly" },
      { loc: "/guarantee", priority: "0.7", changefreq: "monthly" },
      { loc: "/reviews", priority: "0.8", changefreq: "weekly" },
      { loc: "/contacts", priority: "0.7", changefreq: "monthly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "/offer", priority: "0.3", changefreq: "yearly" },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += "  <url>\n";
      xml += `    <loc>${siteUrl}${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += "  </url>\n";
    }

    // Add category pages
    for (const category of categories || []) {
      xml += "  <url>\n";
      xml += `    <loc>${siteUrl}/catalog?category=${category.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(category.updated_at).toISOString().split("T")[0]}</lastmod>\n`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.8</priority>\n";
      xml += "  </url>\n";
    }

    // Add product pages
    for (const product of products || []) {
      xml += "  <url>\n";
      xml += `    <loc>${siteUrl}/product/${product.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(product.updated_at).toISOString().split("T")[0]}</lastmod>\n`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.6</priority>\n";
      xml += "  </url>\n";
    }

    xml += "</urlset>";

    console.log("Sitemap generated successfully");

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating sitemap:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
