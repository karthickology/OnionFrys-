import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({
      app: "ok",
      database: "not_configured",
      message: "Add the Supabase environment variables."
    }, { status: 200 });
  }

  const { error } = await supabase.from("categories").select("id").limit(1);
  if (error) {
    return NextResponse.json({
      app: "ok",
      database: "not_ready",
      message: "Supabase keys are present, but the database migration may not have been run."
    }, { status: 200 });
  }

  return NextResponse.json({ app: "ok", database: "connected" });
}
