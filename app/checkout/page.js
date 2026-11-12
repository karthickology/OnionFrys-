
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout-form";
import "./checkout.css";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();

  if (!supabase) redirect("/login?next=/checkout");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/checkout");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="checkout-shell">
      <CheckoutForm
        customerEmail={user.email || ""}
        customerName={
          profile?.full_name || user.user_metadata?.full_name || ""
        }
      />
    </main>
  );
}

