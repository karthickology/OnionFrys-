import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/account");
  }

  const params = await searchParams;
  const requestedNext = typeof params?.next === "string" ? params.next : "";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  return (
    <main className="auth-shell">
      <Link className="brand" href="/">onion<span>frys.</span></Link>
      <section className="auth-card">
        <div className="eyebrow">Welcome back</div>
        <h1>Sign in</h1>
        <p className="muted">Access your OnionFrys account.</p>
        <AuthForm mode="login" next={next} />
        <p className="auth-switch">New here? <Link href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
