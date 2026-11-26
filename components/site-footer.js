
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/yourusername/",
  },
];

export default function SiteFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer-main">
        <div className="home-footer-brand-section">
          <Link href="/" className="home-footer-brand">
            onion<span>frys.</span>
          </Link>

          <p>
            Good things. Odd energy.
            <br />
            Find something different.
          </p>
        </div>

        <div className="home-footer-column">
          <h3>Discover</h3>
          <Link href="/products">Shop all products</Link>
          <Link href="/products">Explore collection</Link>
        </div>

        <div className="home-footer-column">
          <h3>Your account</h3>
          <Link href="/account">My account</Link>
          <Link href="/cart">Shopping cart</Link>
          <Link href="/login">Sign in</Link>
        </div>

        <div className="home-footer-column">
          <h3>Follow us</h3>
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.name} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="home-footer-bottom">
        <span>
          © {new Date().getFullYear()} OnionFrys. All rights reserved.
        </span>

        <span>GOOD THINGS. ODD ENERGY.</span>
      </div>
    </footer>
  );
}
