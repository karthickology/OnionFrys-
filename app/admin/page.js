
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";
import AdminOrders from "@/components/admin-orders";
import AdminCustomers from "@/components/admin-customers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  if (!supabase) redirect("/login?next=/admin");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login?next=/admin");

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="eyebrow">Restricted area</div>
          <h1>Access denied</h1>
          <p className="muted">
            This account does not have administrator permission.
          </p>
          <p className="muted small-note">{user.email}</p>
          <div className="hero-actions">
            <Link className="button secondary" href="/account">
              My account
            </Link>
            <SignOutButton />
          </div>
        </section>
      </main>
    );
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      order_number,
      customer_email,
      customer_name,
      status,
      payment_status,
      currency,
      total,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        line_total
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: customers, error: customersError } =
    await supabase.rpc("get_admin_customers");

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          onion<span>frys.</span>
        </Link>
        <nav className="nav">
          <Link href="/">Storefront</Link>
          <SignOutButton />
        </nav>
      </header>

      <section className="admin-wrap">
        <div className="eyebrow">
          Operations workspace / secure admin
        </div>

        <h1 className="admin-title">Admin & CRM</h1>
        <p className="muted">
          Signed in as {user.email}
        </p>

        <div className="admin-card">
          <span className="pill">MODULE 5A</span>
          <h2>Order management</h2>
          <p className="muted">
            Manage customer orders and fulfilment status.
          </p>
          <p>
            <strong>Total orders:</strong> {orders?.length || 0}
          </p>
        </div>

        {ordersError ? (
          <div className="admin-card">
            <p>Unable to load orders: {ordersError.message}</p>
          </div>
        ) : (
          <AdminOrders initialOrders={orders || []} />
        )}

        {customersError ? (
          <div className="admin-card">
            <p>
              Unable to load customers: {customersError.message}
            </p>
          </div>
        ) : (
          <AdminCustomers
            initialCustomers={customers || []}
            initialOrders={orders || []}
          />
        )}
      </section>
    </main>
  );
}
