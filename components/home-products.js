
import Link from "next/link";

function ProductCard({ product }) {
  const price = Number(product.price);
  const comparePrice = Number(product.compare_at_price);

  const hasDiscount =
    product.compare_at_price != null &&
    Number.isFinite(comparePrice) &&
    comparePrice > price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="home-product-card"
    >
      <div className="home-product-image">
        {product.image?.url ? (
          <img
            src={product.image.url}
            alt={product.image.alt || product.name}
          />
        ) : (
          <div className="home-product-placeholder">
            <span className="home-product-placeholder-mark">
              onion<span>frys.</span>
            </span>
            <span className="home-product-placeholder-caption">
              SOMETHING DIFFERENT
            </span>
          </div>
        )}

        {hasDiscount && (
          <span className="home-product-badge">
            Special price
          </span>
        )}

        <span className="home-product-quick-view">
          View product →
        </span>
      </div>

      <div className="home-product-info">
        <h3>{product.name}</h3>

        <div className="home-product-prices">
          <strong>
            {product.currency || "USD"} {price.toFixed(2)}
          </strong>

          {hasDiscount && (
            <del>
              {product.currency || "USD"} {comparePrice.toFixed(2)}
            </del>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomeProducts({
  products = [],
  categories = [],
}) {
  if (products.length === 0) {
    return (
      <section className="home-section">
        <h2>Our collection</h2>
        <p>New products are coming soon.</p>
      </section>
    );
  }

  const featuredProducts = products.filter(
    (product) => product.is_featured
  );

  const displayedProducts = (
    featuredProducts.length > 0 ? featuredProducts : products
  ).slice(0, 4);

  return (
    <>
      {categories.length > 0 && (
        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">EXPLORE</span>
              <h2>Shop by category.</h2>
            </div>

            <Link href="/products">All products →</Link>
          </div>

          <div className="home-category-list">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="home-category-link"
              >
                {category.name}
                <span>↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-eyebrow">
              HANDPICKED FOR YOU
            </span>
            <h2>Featured finds.</h2>
          </div>

          <Link href="/products">Explore the store →</Link>
        </div>

        <div className="home-product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-more">
        <span>GOOD THINGS. ODD ENERGY.</span>
        <h2>Your next favourite might be here.</h2>
        <Link href="/products">Explore all products →</Link>
      </section>
    </>
  );
}
