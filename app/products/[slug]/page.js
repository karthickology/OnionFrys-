
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/format-price";
import {
  AddToCartButton,
  CartLink,
} from "@/components/cart-controls";
import { ProductViewTracker } from "@/components/product-view-tracker";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const inStock = product.stock !== null && product.stock > 0;

  return (
    <main className="catalog-page">
      <ProductViewTracker product={product} />

      <header className="catalog-topbar">
        <Link className="catalog-brand" href="/">
          onion<span>frys.</span>
        </Link>

        <nav>
          <Link href="/products">All products</Link>
          <Link href="/account">My account</Link>
          <CartLink />
        </nav>
      </header>

      <div className="product-detail-wrap">
        <div className="product-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <section className="product-detail">
          <div className="product-detail-image">
            {product.image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image.url}
                alt={product.image.alt}
              />
            ) : (
              <div className="product-image-placeholder detail-placeholder">
                <span>
                  {product.categoryNames[0] === "Apparel"
                    ? "👕"
                    : product.categoryNames[0] === "Desk & Tech"
                      ? "🖥️"
                      : "🥔"}
                </span>
                <small>ONIONFRYS OBJECT</small>
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="catalog-eyebrow">
              {product.categoryNames.join(" / ") ||
                "ONIONFRYS COLLECTION"}
            </div>

            {product.is_featured && (
              <span className="product-featured detail-featured">
                Featured item
              </span>
            )}

            <h1>{product.name}</h1>

            <div className="product-detail-price">
              <strong>
                {formatPrice(product.price, product.currency)}
              </strong>

              {product.compare_at_price &&
                Number(product.compare_at_price) >
                  Number(product.price) && (
                  <del>
                    {formatPrice(
                      product.compare_at_price,
                      product.currency
                    )}
                  </del>
                )}
            </div>

            <p className="product-detail-description">
              {product.description ||
                "A little something from OnionFrys."}
            </p>

            <div
              className={`product-stock ${
                inStock ? "available" : "unavailable"
              }`}
            >
              <span />
              {product.stock === null
                ? "Inventory not configured"
                : inStock
                  ? `${product.stock} available`
                  : "Currently out of stock"}
            </div>

            <AddToCartButton product={product} />

            <div className="product-detail-note">
              Your cart is saved in this browser. Final price and
              availability will be verified at checkout.
            </div>

            <Link className="catalog-back-link" href="/products">
              ← Back to all products
            </Link>
          </div>
        </section>
      </div>

      <footer className="catalog-footer">
        <span>onionfrys. — Growth Engineering sandbox</span>
        <Link href="/products">Explore more</Link>
      </footer>
    </main>
  );
}
