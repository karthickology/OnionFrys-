
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
        <div>
          <Link href="/" className="home-footer-brand">
            onion<span>frys.</span>
          </Link>
          <p>Good things. Odd energy.</p>
        </div>

        <div className="home-footer-column">
          <h3>Explore</h3>
          <Link href="/products">All products</Link>
          <Link href="/account">My account</Link>
          <Link href="/cart">Shopping cart</Link>
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
        <span>© {new Date().getFullYear()} OnionFrys.</span>
        <span>Good things. Odd energy.</span>
      </div>
    </footer>
  );
}
