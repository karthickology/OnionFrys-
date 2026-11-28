
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminProductForm from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/products/new");

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (isAdmin !== true) redirect("/admin");

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          onion<span>frys.</span>
        </Link>

        <nav className="nav">
          <Link href="/admin/products">Product management</Link>
          <Link href="/admin">Admin dashboard</Link>
        </nav>
      </header>

      <section className="admin-wrap">
        <div className="eyebrow">ADMINISTRATION / CATALOGUE</div>

        <h1 className="admin-title">Add new product</h1>

        <p className="muted">
          Enter the basic details for your new product.
        </p>

        <AdminProductForm />
      </section>
    </main>
  );
}
