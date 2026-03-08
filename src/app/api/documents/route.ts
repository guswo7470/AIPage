import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: Fetch user's document list or single document by id
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

  // Single document by ID
  if (id) {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("id, title, prompt, document_type, result, file_path, file_url, credits_used, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ document: data });
  }

  // List all documents
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id, title, prompt, document_type, file_url, credits_used, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data });
}

// DELETE: Delete a document record and its file
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
    return NextResponse.json({ error: "Document ID required" }, { status: 400 });
  }

  // Verify ownership and get file_path
  const { data: document } = await supabaseAdmin
    .from("documents")
    .select("user_id, file_path")
    .eq("id", id)
    .single();

  if (!document || document.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete file from storage if exists
  if (document.file_path) {
    await supabaseAdmin.storage
      .from("documents")
      .remove([document.file_path]);
  }

  // Delete from DB
  const { error } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
