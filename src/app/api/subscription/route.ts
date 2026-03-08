import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const POLAR_API = process.env.POLAR_API_URL || "https://api.polar.sh/v1";
const POLAR_TOKEN = process.env.POLAR_ACCESS_TOKEN!;

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  ultra: "Ultra",
  credits: "Credits",
};

const CREDIT_AMOUNT_BY_CENTS: Record<number, number> = {
  2000: 100,
  3000: 150,
  4500: 300,
};

export async function POST(request: Request) {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email;

  try {
    // 1. Fetch subscription info from Polar (needed for live status/dates)
    const subsRes = await fetch(`${POLAR_API}/subscriptions/?limit=100`, {
      headers: { Authorization: `Bearer ${POLAR_TOKEN}` },
    });
    const subsData = await subsRes.json();
    const allSubs = subsData.items ?? [];

    const activeSub = allSubs.find(
      (s: any) =>
        s.customer?.email === email &&
        (s.status === "active" || s.cancel_at_period_end === true)
    );

    const subscription = activeSub
      ? {
          id: activeSub.id,
          status: activeSub.status,
          cancelAtPeriodEnd: activeSub.cancel_at_period_end ?? false,
          currentPeriodStart: activeSub.current_period_start,
          currentPeriodEnd: activeSub.current_period_end,
          productName: activeSub.product?.name ?? "Unknown",
          amount: activeSub.amount ?? 0,
          currency: activeSub.currency ?? "usd",
        }
      : null;

    // 2. Fetch payment history from Supabase (webhook-synced data)
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    let orders: any[] = [];

    if (user) {
      const { data: payments } = await supabaseAdmin
        .from("payments")
        .select("id, plan, amount, currency, status, polar_checkout_id, created_at")
        .eq("user_id", user.id)
        .eq("status", "succeeded")
        .order("created_at", { ascending: false })
        .limit(50);

      orders = (payments ?? []).map((p) => {
        let productName = PLAN_LABELS[p.plan] ?? p.plan;
        if (p.plan === "credits") {
          const qty = CREDIT_AMOUNT_BY_CENTS[p.amount];
          if (qty) productName = `Credits ${qty}`;
        }
        return {
          id: p.id,
          createdAt: p.created_at,
          productName,
          amount: p.amount,
          currency: p.currency,
          billingReason:
            p.plan === "credits" ? "purchase" : "subscription_cycle",
        };
      });
    }

    // 3. If no Supabase payments yet, fallback to Polar orders
    if (orders.length === 0) {
      const ordersRes = await fetch(
        `${POLAR_API}/orders/?sorting=-created_at&limit=50`,
        { headers: { Authorization: `Bearer ${POLAR_TOKEN}` } }
      );
      const ordersData = await ordersRes.json();
      orders = (ordersData.items ?? [])
        .filter((o: any) => o.customer?.email === email)
        .map((o: any) => {
          const amt = o.net_amount ?? o.amount ?? 0;
          let productName = o.product?.name ?? "Unknown";
          const qty = CREDIT_AMOUNT_BY_CENTS[amt];
          if (qty && productName.toLowerCase().includes("credit")) {
            productName = `Credits ${qty}`;
          }
          return {
            id: o.id,
            createdAt: o.created_at,
            productName,
            amount: amt,
            currency: o.currency ?? "usd",
            billingReason: o.billing_reason ?? "purchase",
          };
        });
    }

    return NextResponse.json({ subscription, orders });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}
