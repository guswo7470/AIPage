import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: Fetch user's math solutions list or single by id
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
      .from("math_solutions")
      .select("id, title, input_type, problem_text, image_url, result, credits_used, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ mathSolution: data });
  }

  // List all
  const { data, error } = await supabaseAdmin
    .from("math_solutions")
    .select("id, title, input_type, image_url, credits_used, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mathSolutions: data });
}

// DELETE: Delete a math solution + storage file
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
    return NextResponse.json({ error: "Solution ID required" }, { status: 400 });
  }

  // Verify ownership and get storage path
  const { data: record } = await supabaseAdmin
    .from("math_solutions")
    .select("image_path, user_id")
    .eq("id", id)
    .single();

  if (!record || record.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from storage if image exists (non-fatal)
  if (record.image_path) {
    await supabaseAdmin.storage.from("math-images").remove([record.image_path]);
  }

  // Delete from DB
  const { error } = await supabaseAdmin
    .from("math_solutions")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
