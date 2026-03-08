import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SERVICE_TABLES = [
  "images", "videos", "musics", "documents", "codes",
  "fortunes", "calories", "math_solutions", "writings",
] as const;

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const results = await Promise.all(
    SERVICE_TABLES.map(async (table) => {
      const [
        { count },
        { data: items },
      ] = await Promise.all([
        supabaseAdmin.from(table).select("*", { count: "exact", head: true }),
        supabaseAdmin.from(table).select("user_id, credits_used"),
      ]);

      const totalCredits = items?.reduce((sum, i) => sum + (i.credits_used || 0), 0) ?? 0;

      // Top users by count
      const userCounts: Record<string, { count: number; credits: number }> = {};
      items?.forEach((i) => {
        if (!userCounts[i.user_id]) userCounts[i.user_id] = { count: 0, credits: 0 };
        userCounts[i.user_id].count++;
        userCounts[i.user_id].credits += i.credits_used || 0;
      });

      const topUsers = Object.entries(userCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([userId, stats]) => ({ userId, ...stats }));

      return {
        service: table,
        totalCount: count ?? 0,
        totalCredits,
        topUsers,
      };
    })
  );

  // Resolve user emails for top users
  const allUserIds = [
    ...new Set(results.flatMap((r) => r.topUsers.map((u) => u.userId))),
  ];

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .in("id", allUserIds.length > 0 ? allUserIds : ["none"]);

  const userMap = new Map(users?.map((u) => [u.id, u.email]) || []);

  const services = results.map((r) => ({
    ...r,
    topUsers: r.topUsers.map((u) => ({
      ...u,
      email: userMap.get(u.userId) || u.userId,
    })),
  }));

  return NextResponse.json({ services });
}
