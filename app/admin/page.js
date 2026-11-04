import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPreviewPage() {
  const supabase = await createClient();
  let databaseStatus = "Not configured";
  if (supabase) {
    const { error } = await supabase.from("categories").select("id").limit(1);
    databaseStatus = error ? "Needs database setup" : "Connected";
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">onion<span>frys.</span></Link>
        <nav className="nav"><Link href="/">← Back to storefront</Link></nav>
      </header>
      <section className="admin-wrap">
        <div className="eyebrow">Operations workspace / foundation preview</div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", letterSpacing: "-3px", margin: "14px 0" }}>Admin & CRM</h1>
        <p className="muted" style={{ maxWidth: 650 }}>
          This is the starting shell for the operations side of OnionFrys. Product,
          order and customer management will be added in later modules.
        </p>
        <div className="admin-card">
          <span className="pill">MODULE 1</span>
          <h2>Foundation status</h2>
          <p className="muted">Supabase database: <strong>{databaseStatus}</strong></p>
          <p className="muted">
            Security note: this route currently contains no private customer data or
            management actions. Authentication and server-side admin authorization
            must be completed before real admin functionality is added.
          </p>
        </div>
        <div className="admin-card">
          <h2>Planned workspace</h2>
          <div className="feature-grid">
            <div><strong>Products & inventory</strong><p className="muted">Catalogue, variants and stock.</p></div>
            <div><strong>Orders</strong><p className="muted">Order processing and simulated payments.</p></div>
            <div><strong>Customers & CRM</strong><p className="muted">Profiles, tags, segments and lifecycle.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
