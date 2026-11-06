import Link from "next/link";
import ProductCatalog from "@/components/product-catalog";
import { getCatalogue } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { products, categories, error } = await getCatalogue();

  return (
    <main className="catalog-page">
      <header className="catalog-topbar">
        <Link className="catalog-brand" href="/">onion<span>frys.</span></Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/account">My account</Link>
        </nav>
      </header>

      <section className="catalog-intro">
        <div className="catalog-eyebrow">THE ONIONFRYS COLLECTION</div>
        <h1>Find your <em>next thing.</em></h1>
        <p>Useful things, odd things, and a few things you didn't know you needed.</p>
      </section>

      <section className="catalog-content">
        {error ? (
          <div className="catalog-notice">
            <strong>Catalogue temporarily unavailable.</strong>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-empty">
            <span>🛍️</span>
            <h2>The shelves are empty.</h2>
            <p>There are no published products yet. Add products in the database and publish them to show them here.</p>
          </div>
        ) : (
          <ProductCatalog products={products} categories={categories} />
        )}
      </section>

      <footer className="catalog-footer">
        <span>onionfrys. — Growth Engineering sandbox</span>
        <Link href="/">Back home</Link>
      </footer>
    </main>
  );
}
