
import { createClient } from "@/lib/supabase/server";

export async function getCatalogue() {
  const supabase = await createClient();

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,price,compare_at_price,currency,is_featured,created_at"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (productError) throw new Error(productError.message);

  const products = productRows ?? [];
  if (products.length === 0) {
    return { products: [], categories: [] };
  }

  const productIds = products.map((product) => product.id);

  const [
    { data: categoryRows },
    { data: categoryLinks },
    { data: imageRows },
    { data: variantRows },
  ] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name"),
    supabase
      .from("product_categories")
      .select("product_id,category_id")
      .in("product_id", productIds),
    supabase
      .from("product_images")
      .select("product_id,url,alt_text,is_primary,sort_order")
      .in("product_id", productIds)
      .order("sort_order"),
    supabase
      .from("product_variants")
      .select("id,product_id,sku")
      .eq("is_active", true)
      .in("product_id", productIds),
  ]);

  const variantIds = (variantRows ?? []).map((variant) => variant.id);

  const { data: inventoryRows } =
    variantIds.length > 0
      ? await supabase
          .from("inventory")
          .select("variant_id,quantity_on_hand,reserved_quantity")
          .in("variant_id", variantIds)
      : { data: [] };

  const imageByProduct = new Map();
  for (const image of imageRows ?? []) {
    if (!imageByProduct.has(image.product_id) || image.is_primary) {
      imageByProduct.set(image.product_id, {
        url: image.url,
        alt: image.alt_text,
      });
    }
  }

  const categoryNames = new Map(
    (categoryRows ?? []).map((category) => [category.id, category.name])
  );

  const categoryIdsByProduct = new Map();
  const categoryNamesByProduct = new Map();

  for (const link of categoryLinks ?? []) {
    const ids = categoryIdsByProduct.get(link.product_id) ?? [];
    ids.push(link.category_id);
    categoryIdsByProduct.set(link.product_id, ids);

    const names = categoryNamesByProduct.get(link.product_id) ?? [];
    if (categoryNames.has(link.category_id)) {
      names.push(categoryNames.get(link.category_id));
    }
    categoryNamesByProduct.set(link.product_id, names);
  }

  const stockByVariant = new Map();

  for (const row of inventoryRows ?? []) {
    const available = Math.max(
      0,
      Number(row.quantity_on_hand ?? 0) -
        Number(row.reserved_quantity ?? 0)
    );

    stockByVariant.set(row.variant_id, available);
  }

  const defaultVariantByProduct = new Map();

  for (const variant of variantRows ?? []) {
    if (!defaultVariantByProduct.has(variant.product_id)) {
      defaultVariantByProduct.set(variant.product_id, variant);
    }
  }

  const enrichedProducts = products.map((product) => {
    const variant = defaultVariantByProduct.get(product.id) ?? null;

    return {
      ...product,
      image: imageByProduct.get(product.id) ?? null,
      categoryIds: categoryIdsByProduct.get(product.id) ?? [],
      categoryNames: categoryNamesByProduct.get(product.id) ?? [],
      variantId: variant?.id ?? null,
      sku: variant?.sku ?? null,
      stock:
        variant && stockByVariant.has(variant.id)
          ? stockByVariant.get(variant.id)
          : null,
    };
  });

  return {
    products: enrichedProducts,
    categories: categoryRows ?? [],
  };
}

export async function getProductBySlug(slug) {
  const { products } = await getCatalogue();
  return products.find((product) => product.slug === slug) ?? null;
}
