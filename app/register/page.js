import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/account");
  }

  return (
    <main className="auth-shell">
      <Link className="brand" href="/">onion<span>frys.</span></Link>
      <section className="auth-card">
        <div className="eyebrow">Join the experiment</div>
        <h1>Create account</h1>
        <p className="muted">Create a customer account to continue.</p>
        <AuthForm mode="register" />
        <p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
