import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="auth-shell">
      <header className="account-top">
        <Link className="brand" href="/">onion<span>frys.</span></Link>
        <SignOutButton />
      </header>
      <section className="auth-card account-card">
        <div className="eyebrow">Customer space</div>
        <h1>My account</h1>
        <p className="muted">You are signed in securely.</p>
        <div className="account-detail"><span>Email</span><strong>{user.email}</strong></div>
        <div className="account-detail"><span>Name</span><strong>{profile?.full_name || "Not added yet"}</strong></div>
        <p className="muted small-note">
          Order history, wishlist and profile editing will be added in later modules.
        </p>
        <Link className="button secondary" href="/">Back to home</Link>
      </section>
    </main>
  );
}
