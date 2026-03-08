import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const serviceTables = [
    "images", "videos", "musics", "documents", "codes",
    "fortunes", "calories", "math_solutions", "writings",
  ] as const;

  const [
    { count: totalUsers },
    { count: newUsersWeek },
    { count: newUsersMonth },
    { data: allUsers },
    { data: allPayments },
    ...serviceCounts
  ] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).gte("created_at", monthAgo),
    supabaseAdmin.from("users").select("plan, subscription_status, created_at"),
    supabaseAdmin.from("payments").select("amount, status, plan, created_at"),
    ...serviceTables.map((table) =>
      supabaseAdmin.from(table).select("*", { count: "exact", head: true })
    ),
  ]);

  // Plan distribution
  const planDist = { free: 0, pro: 0, ultra: 0 };
  allUsers?.forEach((u) => {
    if (u.plan in planDist) planDist[u.plan as keyof typeof planDist]++;
  });

  // Active subscriptions
  const activeSubscriptions = allUsers?.filter(
    (u) => u.subscription_status === "active"
  ).length ?? 0;

  // Revenue
  const succeededPayments = allPayments?.filter((p) => p.status === "succeeded") ?? [];
  const totalRevenue = succeededPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthRevenue = succeededPayments
    .filter((p) => p.created_at >= monthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Revenue by day (last 30 days)
  const revenueByDay: Record<string, number> = {};
  succeededPayments
    .filter((p) => p.created_at >= monthAgo)
    .forEach((p) => {
      const day = p.created_at.slice(0, 10);
      revenueByDay[day] = (revenueByDay[day] || 0) + (p.amount || 0);
    });

  // User growth by day (last 30 days)
  const usersByDay: Record<string, number> = {};
  allUsers
    ?.filter((u) => u.created_at >= monthAgo)
    .forEach((u) => {
      const day = u.created_at.slice(0, 10);
      usersByDay[day] = (usersByDay[day] || 0) + 1;
    });

  // Service usage counts
  const serviceUsage = serviceTables.map((table, i) => ({
    service: table,
    count: serviceCounts[i]?.count ?? 0,
  }));

  const totalGenerations = serviceUsage.reduce((sum, s) => sum + s.count, 0);

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    newUsersWeek: newUsersWeek ?? 0,
    newUsersMonth: newUsersMonth ?? 0,
    activeSubscriptions,
    planDistribution: planDist,
    totalRevenue,
    monthRevenue,
    revenueByDay,
    usersByDay,
    serviceUsage,
    totalGenerations,
  });
}
