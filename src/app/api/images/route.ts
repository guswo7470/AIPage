import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteFromR2 } from "@/lib/r2";

// GET: Fetch user's image list
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("images")
    .select("id, title, prompt, aspect_ratio, file_url, credits_used, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

// DELETE: Delete an image record and its file
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
    return NextResponse.json({ error: "Image ID required" }, { status: 400 });
  }

  // Get file_path before deleting record
  const { data: image } = await supabaseAdmin
    .from("images")
    .select("file_path, user_id")
    .eq("id", id)
    .single();

  if (!image || image.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from R2
  await deleteFromR2(image.file_path);

  // Delete from DB
  const { error } = await supabaseAdmin
    .from("images")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
