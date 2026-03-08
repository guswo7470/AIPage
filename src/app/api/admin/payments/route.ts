import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const plan = searchParams.get("plan") || "";
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabaseAdmin
    .from("payments")
    .select(
      "id, user_id, plan, amount, currency, status, polar_checkout_id, created_at, users!inner(email, name)",
      { count: "exact" }
    );

  if (status) query = query.eq("status", status);
  if (plan) query = query.eq("plan", plan);
  if (search) query = query.ilike("users.email", `%${search}%`);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to + "T23:59:59Z");

  query = query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, count, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Summary stats
  const { data: allPayments } = await supabaseAdmin
    .from("payments")
    .select("amount, status");

  const succeeded = allPayments?.filter((p) => p.status === "succeeded") ?? [];
  const failed = allPayments?.filter((p) => p.status === "failed") ?? [];
  const totalRevenue = succeeded.reduce((sum, p) => sum + (p.amount || 0), 0);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: monthPayments } = await supabaseAdmin
    .from("payments")
    .select("amount")
    .eq("status", "succeeded")
    .gte("created_at", monthStart);

  const monthRevenue = monthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

  return NextResponse.json({
    payments: data,
    totalCount: count ?? 0,
    summary: {
      totalRevenue,
      monthRevenue,
      successCount: succeeded.length,
      failedCount: failed.length,
    },
  });
}
