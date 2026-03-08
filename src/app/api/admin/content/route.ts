import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteFromR2 } from "@/lib/r2";

const TABLE_MAP: Record<string, string> = {
  images: "images",
  videos: "videos",
  musics: "musics",
  documents: "documents",
  codes: "codes",
  fortunes: "fortunes",
  calories: "calories",
  math_solutions: "math_solutions",
  writings: "writings",
};

const FILE_TABLES = new Set(["images", "videos", "musics", "documents", "calories", "math_solutions"]);

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (service && TABLE_MAP[service]) {
    const { data, count, error: dbError } = await supabaseAdmin
      .from(TABLE_MAP[service])
      .select("id, user_id, title, credits_used, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Get user emails
    const userIds = [...new Set((data || []).map((d) => d.user_id))];
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .in("id", userIds);

    const userMap = new Map(users?.map((u) => [u.id, u.email]) || []);

    const items = (data || []).map((d) => ({
      ...d,
      service,
      user_email: userMap.get(d.user_id) || "",
    }));

    return NextResponse.json({ content: items, totalCount: count ?? 0 });
  }

  // All services
  const allResults = await Promise.all(
    Object.entries(TABLE_MAP).map(async ([svc, table]) => {
      const { data } = await supabaseAdmin
        .from(table)
        .select("id, user_id, title, credits_used, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({ ...d, service: svc }));
    })
  );

  const merged = allResults
    .flat()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  const userIds = [...new Set(merged.map((d) => d.user_id))];
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .in("id", userIds.length > 0 ? userIds : ["none"]);

  const userMap = new Map(users?.map((u) => [u.id, u.email]) || []);

  const items = merged.map((d) => ({
    ...d,
    user_email: userMap.get(d.user_id) || "",
  }));

  return NextResponse.json({ content: items, totalCount: items.length });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { service, id } = await request.json();

  if (!service || !id || !TABLE_MAP[service]) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const table = TABLE_MAP[service];

  // Delete file from R2 if applicable
  if (FILE_TABLES.has(service)) {
    const col = service === "calories" || service === "math_solutions" ? "image_path" : "file_path";
    const { data: record } = await supabaseAdmin
      .from(table)
      .select(col)
      .eq("id", id)
      .single();

    const filePath = (record as Record<string, string> | null)?.[col];
    if (filePath) {
      await deleteFromR2(filePath);
    }
  }

  const { error: dbError } = await supabaseAdmin
    .from(table)
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
