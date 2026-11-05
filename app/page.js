import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  let user = null;

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">onion<span>frys.</span></Link>
        <nav className="nav">
          <Link href="/products">Explore</Link>
          {user ? <Link href="/account">My account</Link> : <Link href="/login">Sign in</Link>}
          {user
            ? <Link className="nav-cta" href="/account">Account</Link>
            : <Link className="nav-cta" href="/register">Create account</Link>}
        </nav>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">A small store. A serious growth lab.</div>
          <h1>Good things.<br /><em>Odd energy.</em></h1>
          <p className="hero-copy">
            OnionFrys is an ecommerce sandbox for testing product discovery,
            customer journeys and growth experiments.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/register">Create an account</Link>
            <Link className="button secondary" href="/login">Sign in</Link>
          </div>
        </div>
        <div className="hero-art" aria-label="Decorative potato illustration">
          <div className="orbit"><div className="potato">🥔</div></div>
          <div className="art-label">TEST • LEARN • OPTIMIZE</div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div><div className="eyebrow">Module 2</div><h2>Customer identity is ready.</h2></div>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-number">01 / AUTH</span>
            <h3>Customer accounts</h3>
            <p className="muted">Register, sign in and securely access your account.</p>
          </div>
          <div className="feature-card">
            <span className="feature-number">02 / ACCESS</span>
            <h3>Protected admin</h3>
            <p className="muted">Admin permission is checked on the server and in the database.</p>
          </div>
          <div className="feature-card">
            <span className="feature-number">03 / NEXT</span>
            <h3>Store catalogue</h3>
            <p className="muted">Product browsing and management arrive in Module 3.</p>
          </div>
        </div>
      </section>
      <footer className="footer">
        <span>onionfrys. — Growth Engineering sandbox</span>
        <Link href="/admin">Admin workspace</Link>
      </footer>
    </main>
  );
}
