
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const promotions = [
  {
    eyebrow: "WELCOME TO ONIONFRYS",
    heading: "Good things.",
    accent: "Odd energy.",
    description:
      "Discover something different. Find your next favourite.",
    button: "Explore the collection",
    label: "THE ONIONFRYS COLLECTION",
    theme: "promo-green",
  },
  {
    eyebrow: "FRESH FINDS",
    heading: "Find your",
    accent: "next thing.",
    description:
      "Interesting finds for everyday life. Explore the collection.",
    button: "Discover the store",
    label: "FIND SOMETHING DIFFERENT",
    theme: "promo-cream",
  },
  {
    eyebrow: "MADE TO STAND OUT",
    heading: "Not your",
    accent: "usual store.",
    description:
      "Explore products with a little more personality.",
    button: "Shop all products",
    label: "GOOD THINGS. ODD ENERGY.",
    theme: "promo-dark",
  },
];

export default function HomePromotions({ products = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const promotion = promotions[active];
  const featuredProduct = products[0];

  const destination = featuredProduct
    ? `/products/${featuredProduct.slug}`
    : "/products";

  return (
    <section
      className={`home-promo ${promotion.theme}`}
      aria-label="OnionFrys promotions"
    >
      <div className="home-promo-content">
        <span className="home-promo-eyebrow">
          {promotion.eyebrow}
        </span>

        <h1>
          {promotion.heading}
          <br />
          <em>{promotion.accent}</em>
        </h1>

        <p>{promotion.description}</p>

        <Link className="home-promo-button" href={destination}>
          {promotion.button}
          <span aria-hidden="true">→</span>
        </Link>

        <div className="home-promo-controls">
          <button
            type="button"
            aria-label="Previous promotion"
            onClick={() =>
              setActive(
                (current) =>
                  (current - 1 + promotions.length) % promotions.length
              )
            }
          >
            ←
          </button>

          <span>
            {active + 1} / {promotions.length}
          </span>

          <button
            type="button"
            aria-label="Next promotion"
            onClick={() =>
              setActive((current) => (current + 1) % promotions.length)
            }
          >
            →
          </button>
        </div>
      </div>

      <Link
        href={destination}
        className="home-promo-image home-promo-art"
        aria-label="Explore the OnionFrys collection"
      >
        <div className="promo-art-circle">
          <span>onion</span>
          <strong>frys.</strong>
        </div>

        <span className="home-promo-image-label">
          {promotion.label}
        </span>
      </Link>
    </section>
  );
}
