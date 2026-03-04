import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: Fetch user's fortune list or single fortune by id
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Single fortune by ID
  if (id) {
    const { data, error } = await supabaseAdmin
      .from("fortunes")
      .select("id, title, birth_date, calendar_type, is_leap_month, birth_time, gender, result, credits_used, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ fortune: data });
  }

  // List all fortunes
  const { data, error } = await supabaseAdmin
    .from("fortunes")
    .select("id, title, birth_date, calendar_type, gender, credits_used, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ fortunes: data });
}

// DELETE: Delete a fortune record
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Fortune ID required" }, { status: 400 });
  }

  // Verify ownership
  const { data: fortune } = await supabaseAdmin
    .from("fortunes")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!fortune || fortune.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from DB
  const { error } = await supabaseAdmin
    .from("fortunes")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
