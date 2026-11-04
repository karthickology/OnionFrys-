
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({
        app: "ok",
        database: "not_configured"
      });
    }

    const { error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json({
        app: "ok",
        database: "not_ready",
        error_code: error.code,
        error_message: error.message
      });
    }

    return NextResponse.json({
      app: "ok",
      database: "connected"
    });

  } catch (error) {
    return NextResponse.json({
      app: "error",
      message: error.message
    }, { status: 500 });
  }
}
