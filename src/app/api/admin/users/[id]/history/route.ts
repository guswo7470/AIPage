import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const tables = [
    { name: "images", service: "images" },
    { name: "videos", service: "videos" },
    { name: "musics", service: "musics" },
    { name: "documents", service: "documents" },
    { name: "codes", service: "codes" },
    { name: "fortunes", service: "fortunes" },
    { name: "calories", service: "calories" },
    { name: "math_solutions", service: "math_solutions" },
    { name: "writings", service: "writings" },
  ];

  const results = await Promise.all(
    tables.map(({ name }) =>
      supabaseAdmin
        .from(name)
        .select("id, title, credits_used, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50)
    )
  );

  const history = tables.flatMap(({ service }, i) =>
    (results[i].data || []).map((item) => ({
      ...item,
      service,
    }))
  );

  history.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ history });
}
