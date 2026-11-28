
import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

const navigation = [
  {
    heading: "WORKSPACE",
    items: [
      { label: "Dashboard", href: "/admin", icon: "▦" },
      { label: "Products", href: "/admin/products", icon: "▣" },
      { label: "Orders", icon: "▤", upcoming: true },
      { label: "Customers", icon: "♙", upcoming: true },
      { label: "Inventory", icon: "▥", upcoming: true },
    ],
  },
  {
    heading: "GROWTH",
    items: [
      { label: "Marketing", icon: "↗", upcoming: true },
      { label: "Analytics", icon: "▥", upcoming: true },
      { label: "Automations", icon: "◷", upcoming: true },
    ],
  },
  {
    heading: "SYSTEM",
    items: [
      { label: "Settings", icon: "⚙", upcoming: true },
    ],
  },
];

export default function AdminLayout({ children }) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          onion<span>frys.</span>
        </Link>

        <div className="admin-workspace-label">
          STORE MANAGEMENT
        </div>

        {navigation.map((group) => (
          <div className="admin-nav-group" key={group.heading}>
            <p className="admin-nav-heading">{group.heading}</p>

            {group.items.map((item) =>
              item.upcoming ? (
                <div
                  className="admin-nav-link is-upcoming"
                  key={item.label}
                  title="Coming soon"
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="admin-nav-soon">Soon</span>
                </div>
              ) : (
                <Link
                  className="admin-nav-link"
                  href={item.href}
                  key={item.label}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            )}
          </div>
        )}

        <div className="admin-sidebar-bottom">
          <Link href="/" className="admin-store-link">
            ↗ View storefront
          </Link>

          <SignOutButton />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">
              ONIONFRYS / ADMINISTRATION
            </span>
            <p>Store management workspace</p>
          </div>

          <Link href="/" className="admin-view-store">
            View store ↗
          </Link>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
