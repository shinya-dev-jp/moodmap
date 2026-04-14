import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const address = authenticateRequest(req);
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = body.display_name?.trim?.();
  if (!name || name.length < 1 || name.length > 30) {
    return NextResponse.json({ error: "Invalid display_name (1-30 chars)" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("mm_users")
    .update({ display_name: name })
    .eq("address", address);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, display_name: name });
}
