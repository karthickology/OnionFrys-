
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCatalogue } from "@/lib/catalog";
import HomePromotions from "@/components/home-promotions";
import HomeProducts from "@/components/home-products";
import SiteFooter from "@/components/site-footer";
import "./homepage.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  let user = null;

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  }

  const { products, categories } = await getCatalogue();

  return (
    <main className="site-shell home-storefront">
      <header className="topbar">
        <Link className="brand" href="/">
          onion<span>frys</span>.
        </Link>

        <nav className="nav">
          <Link href="/products">Shop</Link>
          <Link href="/cart">Cart</Link>

          {user ? (
            <Link href="/account">My account</Link>
          ) : (
            <Link href="/login">Sign in</Link>
          )}

          {user ? (
            <Link className="nav-cta" href="/account">
              Account
            </Link>
          ) : (
            <Link className="nav-cta" href="/register">
              Create account
            </Link>
          )}
        </nav>
      </header>

      <div className="home-container">
        <HomePromotions products={products} />
        <HomeProducts
          products={products}
          categories={categories}
        />
        <SiteFooter />
      </div>
    </main>
  );
}
