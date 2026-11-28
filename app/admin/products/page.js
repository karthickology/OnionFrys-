

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format-price";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  if (!supabase) redirect("/login?next=/admin/products");

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) redirect("/login?next=/admin/products");

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (isAdmin !== true) redirect("/admin");

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,price,currency,status,is_featured,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">onion<span>frys.</span></Link>
        <nav className="nav">
          <Link href="/admin">Admin dashboard</Link>
          <Link href="/">Storefront</Link>
        </nav>
      </header>

      <section className="admin-wrap">
        <div className="eyebrow">ADMINISTRATION / CATALOGUE</div>
        <h1 className="admin-title">Product management</h1>
        <p className="muted">
          Manage your product catalogue and publication status.
        </p>

        <div className="admin-card">
          <h2>Products ({products?.length || 0})</h2>

          {error ? (
            <p>Unable to load products: {error.message}</p>
          ) : !products?.length ? (
            <p className="muted">No products found.</p>
          ) : (
            products.map((product) => (
              <article key={product.id} style={{
                padding: "16px 0",
                borderBottom: "1px solid #e5e7df"
              }}>
                <h3>{product.name}</h3>
                <p className="muted">SKU slug: {product.slug}</p>
                <p>
                  {formatPrice(Number(product.price), product.currency)}
                </p>
                <p>Status: <strong>{product.status}</strong></p>
                <p>Featured: {product.is_featured ? "Yes" : "No"}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
