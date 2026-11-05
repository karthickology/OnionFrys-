import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/admin");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/admin");

  // The database function is the authorization authority; never trust browser-supplied roles.
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="eyebrow">Restricted area</div>
          <h1>Access denied</h1>
          <p className="muted">This account does not have administrator permission.</p>
          <p className="muted small-note">Signed in as {user.email}</p>
          <div className="hero-actions">
            <Link className="button secondary" href="/account">My account</Link>
            <SignOutButton />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">onion<span>frys.</span></Link>
        <nav className="nav">
          <Link href="/">Storefront</Link>
          <SignOutButton />
        </nav>
      </header>
      <section className="admin-wrap">
        <div className="eyebrow">Operations workspace / secure admin</div>
        <h1 className="admin-title">Admin & CRM</h1>
        <p className="muted">Administrator access verified by Supabase Auth and the database.</p>
        <div className="admin-card">
          <span className="pill">MODULE 2</span>
          <h2>Security foundation</h2>
          <p className="muted">Signed in as <strong>{user.email}</strong></p>
          <p className="muted">
            Your admin role is checked server-side using <code>public.is_admin()</code>.
            Product and order management will be added in later modules.
          </p>
        </div>
        <div className="admin-card">
          <h2>Next workspace modules</h2>
          <div className="feature-grid">
            <div><strong>Products & inventory</strong><p className="muted">Catalogue and stock management.</p></div>
            <div><strong>Orders</strong><p className="muted">Order processing and simulated payments.</p></div>
            <div><strong>Customers & CRM</strong><p className="muted">Profiles, tags, segments and lifecycle.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
