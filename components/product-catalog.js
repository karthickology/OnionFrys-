
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { AddToCartButton, CartLink } from "@/components/cart-controls";

export default function ProductCatalog({ products, categories }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description || "").toLowerCase().includes(term) ||
        product.categoryNames.some((name) =>
          name.toLowerCase().includes(term)
        );

      const matchesCategory =
        category === "all" || product.categoryIds.includes(category);

      return matchesSearch && matchesCategory;
    });

    result = [...result];

    if (sort === "price-low")
      result.sort((a, b) => Number(a.price) - Number(b.price));

    if (sort === "price-high")
      result.sort((a, b) => Number(b.price) - Number(a.price));

    if (sort === "name")
      result.sort((a, b) => a.name.localeCompare(b.name));

    if (sort === "featured")
      result.sort(
        (a, b) => Number(b.is_featured) - Number(a.is_featured)
      );

    return result;
  }, [products, search, category, sort]);

  return (
    <>
      <div className="catalog-controls">
        <label className="catalog-search">
          <span>Search products</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try potato, desk, tee..."
          />
        </label>

        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="featured">Featured first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>

        <CartLink />
      </div>

      <div className="catalog-result-line">
        <span>{visibleProducts.length} products</span>

        {(search || category !== "all" || sort !== "featured") && (
          <button
            className="catalog-reset"
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSort("featured");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <Link
                className="product-image-wrap"
                href={`/products/${product.slug}`}
              >
                {product.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image.url}
                    alt={product.image.alt}
                  />
                ) : (
                  <div
                    className="product-image-placeholder"
                    aria-label="No product image"
                  >
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

                {product.is_featured && (
                  <span className="product-featured">Featured</span>
                )}
              </Link>

              <div className="product-card-body">
                <div className="product-card-category">
                  {product.categoryNames.join(" · ") || "OnionFrys"}
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="product-card-title"
                >
                  {product.name}
                </Link>

                <p>
                  {product.description ||
                    "A little something from OnionFrys."}
                </p>

                <div className="product-card-bottom">
                  <div>
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

                  <Link
                    className="product-view-link"
                    href={`/products/${product.slug}`}
                  >
                    View item ↗
                  </Link>
                </div>

                <AddToCartButton product={product} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <span>🥔</span>
          <h2>No products found</h2>
          <p>Try another search or clear your filters.</p>
        </div>
      )}
    </>
  );
}
