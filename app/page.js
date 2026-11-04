import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getConnectionStatus() {
  const supabase = await createClient();
  if (!supabase) return { connected: false, message: "Supabase keys not configured yet" };

  const { error } = await supabase.from("categories").select("id").limit(1);
  if (error) {
    return { connected: false, message: "Supabase is configured, but database setup is incomplete" };
  }
  return { connected: true, message: "Supabase database is reachable" };
}

export default async function HomePage() {
  const status = await getConnectionStatus();

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">onion<span>frys</span>.</Link>
        <nav className="nav">
          <a className="hide-mobile" href="#approach">How it works</a>
          <Link href="/admin">Admin preview</Link>
          <a className="nav-cta" href="#foundation">Project status</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">The ecommerce growth lab</div>
          <h1>Good products.<br /><em>Smarter growth.</em></h1>
          <p className="hero-copy">
            OnionFrys is a working ecommerce sandbox built to explore the complete
            customer journey — from first click to repeat purchase.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#approach">Explore the project</a>
            <Link className="button secondary" href="/admin">Open admin preview ↗</Link>
          </div>
        </div>
        <div className="hero-art" aria-label="Playful potato illustration">
          <div className="orbit"><div className="potato">🥔</div></div>
          <div className="art-label">TEST • LEARN • GROW</div>
        </div>
      </section>

      <section className="section" id="approach">
        <div className="section-head">
          <div>
            <div className="eyebrow">One connected system</div>
            <h2>Storefront meets growth operations.</h2>
          </div>
          <p className="muted">One application. One database. Two interfaces.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-number">01 / STOREFRONT</div>
            <h3>Customer experience</h3>
            <p className="muted">Product discovery, cart, checkout, accounts and post-purchase journeys.</p>
          </article>
          <article className="feature-card">
            <div className="feature-number">02 / ADMIN + CRM</div>
            <h3>Customer operations</h3>
            <p className="muted">Products, inventory, orders, customer profiles, segments and lifecycle activity.</p>
          </article>
          <article className="feature-card">
            <div className="feature-number">03 / GROWTH</div>
            <h3>Measurement + experiments</h3>
            <p className="muted">UTMs, GTM, GA4, funnels, CRO experiments, retention and business analytics.</p>
          </article>
        </div>
        <div className="status-panel" id="foundation">
          <div>
            <div className="eyebrow">Foundation check</div>
            <strong><span className="status-dot" />{status.message}</strong>
          </div>
          <span className="pill">{status.connected ? "DATABASE CONNECTED" : "SETUP IN PROGRESS"}</span>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} OnionFrys</span>
        <span>Built as a Growth Engineering portfolio project.</span>
      </footer>
    </main>
  );
}
