
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePromotions({ products = [] }) {
  const promotionProducts = products.slice(0, 3);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (promotionProducts.length < 2) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % promotionProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [promotionProducts.length]);

  if (promotionProducts.length === 0) return null;

  const product = promotionProducts[active];

  const messages = [
    {
      eyebrow: "THE ONIONFRYS COLLECTION",
      heading: "Good things.",
      accent: "Odd energy.",
      description: "Discover something different. Find your next favourite.",
      button: "Explore this product",
    },
    {
      eyebrow: "FRESH FINDS",
      heading: "Find your",
      accent: "next thing.",
      description: "Interesting finds for everyday life.",
      button: "Discover this product",
    },
    {
      eyebrow: "MADE TO STAND OUT",
      heading: "Not your",
      accent: "usual store.",
      description: "Explore products with a little more personality.",
      button: "Shop this product",
    },
  ];

  const message = messages[active % messages.length];

  return (
    <section className="home-promo" aria-label="Featured promotions">
      <div className="home-promo-content">
        <span className="home-promo-eyebrow">{message.eyebrow}</span>

        <h1>
          {message.heading}
          <br />
          <em>{message.accent}</em>
        </h1>

        <p>{message.description}</p>

        <Link
          className="home-promo-button"
          href={`/products/${product.slug}`}
        >
          {message.button} <span aria-hidden="true">→</span>
        </Link>

        <div className="home-promo-controls">
          <button
            type="button"
            aria-label="Previous promotion"
            onClick={() =>
              setActive((current) =>
                (current - 1 + promotionProducts.length) %
                promotionProducts.length
              )
            }
          >
            ←
          </button>

          <span>
            {active + 1} / {promotionProducts.length}
          </span>

          <button
            type="button"
            aria-label="Next promotion"
            onClick={() =>
              setActive((current) =>
                (current + 1) % promotionProducts.length
              )
            }
          >
            →
          </button>
        </div>
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="home-promo-image"
        aria-label={`View ${product.name}`}
      >
        {product.image?.url ? (
          <img src={product.image.url} alt={product.image.alt || product.name} />
        ) : (
          <div className="home-promo-image-placeholder">
            onionfrys.
          </div>
        )}

        <span className="home-promo-image-label">
          FEATURED FIND
        </span>
      </Link>
    </section>
  );
}
