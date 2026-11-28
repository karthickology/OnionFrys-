
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";
import AdminOrders from "@/components/admin-orders";
import AdminCustomers from "@/components/admin-customers";
import AdminActivity from "@/components/admin-activity";

export const dynamic = "force-dynamic";

function formatCurrency(value, currency = "AED") {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: currency || "AED",
  }).format(Number(value) || 0);
}

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

  const { data: carts, error: cartsError } = await supabase
    .from("customer_carts")
    .select(`
      id,
      user_id,
      email,
      items,
      subtotal,
      currency,
      status,
      last_activity_at,
      abandoned_at
    `)
    .order("last_activity_at", { ascending: false })
    .limit(50);

  const { data: automationLogs, error: logsError } =
    await supabase
      .from("automation_logs")
      .select(`
        id,
        user_id,
        automation_type,
        status,
        details,
        executed_at
      `)
      .order("executed_at", { ascending: false })
      .limit(20);

  const [
    abandonedResult,
    followupResult,
    completedResult,
    pendingResult,
    simulatedResult,
  ] = await Promise.all([
    supabase
      .from("automation_logs")
      .select("id", { count: "exact", head: true })
      .eq("automation_type", "abandoned_cart_detected"),

    supabase
      .from("automation_logs")
      .select("id", { count: "exact", head: true })
      .eq("automation_type", "post_purchase_followup"),

    supabase
      .from("automation_logs")
      .select("id", { count: "exact", head: true })
      .eq("automation_type", "post_purchase_followup")
      .eq("status", "completed"),

    supabase
      .from("automation_logs")
      .select("id", { count: "exact", head: true })
      .eq("automation_type", "post_purchase_followup")
      .eq("status", "pending"),

    supabase
      .from("automation_logs")
      .select("id", { count: "exact", head: true })
      .eq("automation_type", "post_purchase_followup")
      .eq("status", "completed")
      .eq("details->>email_sent", "false"),
  ]);

  const allOrders = orders || [];
  const allCarts = carts || [];

  const paidOrders = allOrders.filter(
    (order) => order.payment_status === "paid"
  );

  const paidRevenueByCurrency = paidOrders.reduce((totals, order) => {
    const currency = order.currency || "AED";
    totals[currency] = (totals[currency] || 0) + Number(order.total || 0);
    return totals;
  }, {});

  const revenueDisplay = Object.entries(paidRevenueByCurrency);

  const activeCarts = allCarts.filter(
    (cart) => cart.status === "active"
  ).length;

  const abandonedCarts = allCarts.filter(
    (cart) => cart.status === "abandoned"
  ).length;

  const campaignMetrics = [
    {
      label: "Abandoned carts detected",
      value: abandonedResult.count ?? 0,
    },
    {
      label: "Post-purchase campaigns created",
      value: followupResult.count ?? 0,
    },
    {
      label: "Campaigns completed",
      value: completedResult.count ?? 0,
    },
    {
      label: "Pending campaigns",
      value: pendingResult.count ?? 0,
    },
    {
      label: "Simulated campaign completions",
      value: simulatedResult.count ?? 0,
    },
  ];

  return (
    <main className="admin-products-page">
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">STORE OVERVIEW / OPERATIONS</div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="muted">
            Monitor store performance, orders, customers and retention activity.
          </p>
        </div>

        <Link href="/" className="button secondary">
          View storefront ↗
        </Link>
      </div>

      {/* STORE PERFORMANCE */}
      <section className="admin-product-stats">
        <div className="admin-stat-card">
          <span>Orders loaded</span>
          <strong>{allOrders.length}</strong>
          <small>Latest 100 orders</small>
        </div>

        <div className="admin-stat-card">
          <span>Paid orders</span>
          <strong>{paidOrders.length}</strong>
          <small>Successfully paid orders</small>
        </div>

        <div className="admin-stat-card">
          <span>Active carts</span>
          <strong>{activeCarts}</strong>
          <small>Currently active carts</small>
        </div>

        <div className="admin-stat-card">
          <span>Abandoned carts</span>
          <strong>{abandonedCarts}</strong>
          <small>Currently abandoned carts</small>
        </div>
      </section>

      {/* REVENUE */}
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Paid order value</h2>
            <p className="muted">
              Revenue from paid orders in the latest 100 orders loaded.
            </p>
          </div>
        </div>

        {revenueDisplay.length === 0 ? (
          <p className="muted">No paid orders recorded yet.</p>
        ) : (
          <div className="admin-product-stats">
            {revenueDisplay.map(([currency, total]) => (
              <div className="admin-stat-card" key={currency}>
                <span>{currency} revenue</span>
                <strong>{formatCurrency(total, currency)}</strong>
                <small>Paid orders only</small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ORDERS */}
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Order management</h2>
            <p className="muted">
              Review customer orders and manage their status.
            </p>
          </div>
          <span className="admin-result-count">
            {allOrders.length} loaded
          </span>
        </div>

        {ordersError ? (
          <p>Unable to load orders: {ordersError.message}</p>
        ) : (
          <AdminOrders initialOrders={allOrders} />
        )}
      </section>

      {/* CUSTOMERS */}
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Customer management</h2>
            <p className="muted">
              Review customer information and purchase activity.
            </p>
          </div>
        </div>

        {customersError ? (
          <p>Unable to load customers: {customersError.message}</p>
        ) : (
          <AdminCustomers
            initialCustomers={customers || []}
            initialOrders={allOrders}
          />
        )}
      </section>

      {/* CRM AUTOMATION */}
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <div className="eyebrow">CUSTOMER RETENTION</div>
            <h2>CRM automation</h2>
            <p className="muted">
              Monitor abandoned carts and post-purchase campaigns.
            </p>
          </div>
          <span className="admin-status-pill published">
            Simulation mode
          </span>
        </div>

        <div className="admin-product-stats">
          {campaignMetrics.map((metric) => (
            <div className="admin-stat-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>

        <p className="muted">
          Campaign delivery is simulated. No real emails are sent.
        </p>
      </section>

      {/* RECENT ACTIVITY */}
      <AdminActivity
        carts={allCarts}
        cartsError={cartsError}
        automationLogs={automationLogs}
        logsError={logsError}
      />
    </main>
  );
}
