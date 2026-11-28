
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?next=/admin/products");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/products");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (isAdmin !== true) {
    redirect("/admin");
  }

  const params = await searchParams;
  const search = String(params?.search || "").trim();
  const activeStatus = String(params?.status || "all");

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      currency,
      status,
      is_featured,
      created_at
    `)
    .order("created_at", { ascending: false });

  const allProducts = products || [];

  const totalProducts = allProducts.length;
  const publishedProducts = allProducts.filter(
    (product) => product.status === "published"
  ).length;
  const draftProducts = allProducts.filter(
    (product) => product.status === "draft"
  ).length;
  const featuredProducts = allProducts.filter(
    (product) => product.is_featured
  ).length;

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      activeStatus === "all" ||
      product.status === activeStatus;

    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { label: "All products", value: "all", count: totalProducts },
    { label: "Published", value: "published", count: publishedProducts },
    { label: "Drafts", value: "draft", count: draftProducts },
  ];

  return (
    <main className="admin-products-page">
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">CATALOGUE MANAGEMENT</div>
          <h1 className="admin-title">Products</h1>
          <p className="muted">
            Manage your product catalogue, pricing and publication status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="button primary"
        >
          + Add product
        </Link>
      </div>

      {error ? (
        <div className="admin-panel">
          <p>Unable to load products: {error.message}</p>
        </div>
      ) : (
        <>
          <div className="admin-product-stats">
            <div className="admin-stat-card">
              <span>Total products</span>
              <strong>{totalProducts}</strong>
              <small>Products in your catalogue</small>
            </div>

            <div className="admin-stat-card">
              <span>Published</span>
              <strong>{publishedProducts}</strong>
              <small>Visible on your storefront</small>
            </div>

            <div className="admin-stat-card">
              <span>Drafts</span>
              <strong>{draftProducts}</strong>
              <small>Not published</small>
            </div>

            <div className="admin-stat-card">
              <span>Featured</span>
              <strong>{featuredProducts}</strong>
              <small>Featured products</small>
            </div>
          </div>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Product catalogue</h2>
                <p className="muted">
                  View and organize all your store products.
                </p>
              </div>
              <span className="admin-result-count">
                {filteredProducts.length} products
              </span>
            </div>

            <div className="admin-product-tabs">
              {tabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={`/admin/products?status=${tab.value}&search=${encodeURIComponent(search)}`}
                  className={
                    activeStatus === tab.value
                      ? "admin-product-tab active"
                      : "admin-product-tab"
                  }
                >
                  {tab.label}
                  <span>{tab.count}</span>
                </Link>
              ))}
            </div>

            <form
              action="/admin/products"
              method="GET"
              className="admin-product-toolbar"
            >
              <input
                type="hidden"
                name="status"
                value={activeStatus}
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search by product name or slug..."
                aria-label="Search products"
              />

              <button className="button secondary" type="submit">
                Search
              </button>

              {search && (
                <Link
                  href={`/admin/products?status=${activeStatus}`}
                  className="admin-clear-search"
                >
                  Clear
                </Link>
              )}
            </form>

            <div className="admin-table-scroll">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Date added</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-identity">
                          <div className="admin-product-placeholder">
                            {product.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <small>{product.slug}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {formatPrice(
                            Number(product.price),
                            product.currency
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-status-pill ${
                            product.status === "published"
                              ? "published"
                              : "draft"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td>
                        {product.is_featured ? (
                          <span className="admin-featured-label">
                            Featured
                          </span>
                        ) : (
                          <span className="admin-muted-label">
                            Standard
                          </span>
                        )}
                      </td>

                      <td>
                        {new Date(product.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/admin/products/${product.slug}`}
                          className="admin-table-action"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="admin-empty-state">
                  <h3>No products found</h3>
                  <p className="muted">
                    Try another search or change the selected status.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
