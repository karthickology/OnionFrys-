import { createClient } from "@/lib/supabase/server";

export async function getCatalogue() {
  const supabase = await createClient();

  if (!supabase) {
    return { products: [], categories: [], error: "Supabase is not configured." };
  }

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("id,name,slug,description,price,compare_at_price,currency,is_featured,created_at")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (productError) {
    return { products: [], categories: [], error: "Could not load products. Check the Supabase connection and catalogue permissions." };
  }

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id,name,slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const products = productRows || [];
  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) {
    return { products: [], categories: categoryRows || [], error: null };
  }

  const [
    { data: categoryLinks },
    { data: imageRows },
    { data: variantRows }
  ] = await Promise.all([
    supabase.from("product_categories").select("product_id,category_id").in("product_id", productIds),
    supabase.from("product_images").select("product_id,storage_path,alt_text,sort_order").in("product_id", productIds).order("sort_order", { ascending: true }),
    supabase.from("product_variants").select("id,product_id").eq("is_active", true).in("product_id", productIds)
  ]);

  const variantIds = (variantRows || []).map((variant) => variant.id);
  let inventoryRows = [];

  if (variantIds.length > 0) {
    const { data } = await supabase
      .from("inventory")
      .select("variant_id,quantity_on_hand,reserved_quantity")
      .in("variant_id", variantIds);
    inventoryRows = data || [];
  }

  const categoryMap = new Map((categoryRows || []).map((category) => [category.id, category]));
  const imageByProduct = new Map();

  for (const image of imageRows || []) {
    if (!imageByProduct.has(image.product_id)) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(image.storage_path);
      imageByProduct.set(image.product_id, {
        url: data?.publicUrl || null,
        alt: image.alt_text || "Product image"
      });
    }
  }

  const categoryIdsByProduct = new Map();
  for (const link of categoryLinks || []) {
    const current = categoryIdsByProduct.get(link.product_id) || [];
    current.push(link.category_id);
    categoryIdsByProduct.set(link.product_id, current);
  }

  const stockByProduct = new Map();
  const productIdByVariant = new Map((variantRows || []).map((variant) => [variant.id, variant.product_id]));

  for (const inventory of inventoryRows) {
    const productId = productIdByVariant.get(inventory.variant_id);
    if (!productId) continue;
    const available = Math.max(0, inventory.quantity_on_hand - inventory.reserved_quantity);
    stockByProduct.set(productId, (stockByProduct.get(productId) || 0) + available);
  }

  const enrichedProducts = products.map((product) => {
    const categoryIds = categoryIdsByProduct.get(product.id) || [];
    const productCategories = categoryIds.map((id) => categoryMap.get(id)).filter(Boolean);

    return {
      ...product,
      image: imageByProduct.get(product.id) || null,
      categoryIds,
      categoryNames: productCategories.map((category) => category.name),
      stock: stockByProduct.get(product.id) ?? null
    };
  });

  return { products: enrichedProducts, categories: categoryRows || [], error: null };
}

export async function getProductBySlug(slug) {
  const catalogue = await getCatalogue();
  return catalogue.products.find((product) => product.slug === slug) || null;
}
