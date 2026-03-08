import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteFromR2 } from "@/lib/r2";

// GET: Fetch user's calorie analyses list or single by id
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

  // Single record by ID
  if (id) {
    const { data, error } = await supabaseAdmin
      .from("calories")
      .select("id, title, food_name, image_url, result, credits_used, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ calorie: data });
  }

  // List all
  const { data, error } = await supabaseAdmin
    .from("calories")
    .select("id, title, food_name, image_url, credits_used, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ calories: data });
}

// DELETE: Delete a calorie record + storage file
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
    return NextResponse.json({ error: "Calorie ID required" }, { status: 400 });
  }

  // Verify ownership and get storage path
  const { data: record } = await supabaseAdmin
    .from("calories")
    .select("image_path, user_id")
    .eq("id", id)
    .single();

  if (!record || record.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from R2 (non-fatal)
  await deleteFromR2(record.image_path);

  // Delete from DB
  const { error } = await supabaseAdmin
    .from("calories")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
