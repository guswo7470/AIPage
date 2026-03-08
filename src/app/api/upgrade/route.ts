import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const POLAR_API = process.env.POLAR_API_URL || "https://api.polar.sh/v1";
const POLAR_TOKEN = process.env.POLAR_ACCESS_TOKEN!;

const PRODUCT_IDS: Record<string, string> = {
  pro: process.env.POLAR_PRO_PRODUCT_ID!,
  ultra: process.env.POLAR_ULTRA_PRODUCT_ID!,
};

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, ultra: 2 };

async function getSubscription(email: string) {
  const res = await fetch(`${POLAR_API}/subscriptions/?limit=100`, {
    headers: { Authorization: `Bearer ${POLAR_TOKEN}` },
  });
  const data = await res.json();
  const items = data.items ?? [];
  return items.find(
    (s: any) =>
      s.customer?.email === email &&
      (s.status === "active" || s.cancel_at_period_end === true)
  );
}

async function patchSubscription(subscriptionId: string, body: object) {
  return fetch(`${POLAR_API}/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${POLAR_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function POST(request: Request) {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email;
  const { plan } = await request.json();

  const newProductId = PRODUCT_IDS[plan];
  if (!newProductId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const subscription = await getSubscription(email);
    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // 현재 유저 정보
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, plan, pending_plan")
      .eq("email", email)
      .single();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPlan = user.plan;

    // ── 다운그레이드 취소 (pending 상태에서 원래 플랜 선택) ──
    if (user.pending_plan && plan === currentPlan) {
      // Polar 상품을 원래 플랜으로 복원
      if (subscription.cancel_at_period_end) {
        await patchSubscription(subscription.id, { cancel_at_period_end: false });
      }
      const res = await patchSubscription(subscription.id, {
        product_id: PRODUCT_IDS[currentPlan],
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json(
          { error: err.detail ?? "Failed to cancel downgrade" },
          { status: res.status }
        );
      }

      await supabaseAdmin
        .from("users")
        .update({ pending_plan: null })
        .eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    // ── 다운그레이드 (높은 플랜 → 낮은 플랜) ──
    const isDowngrade = (PLAN_RANK[plan] ?? 0) < (PLAN_RANK[currentPlan] ?? 0);

    if (isDowngrade) {
      // 취소 예약 상태라면 먼저 철회
      if (subscription.cancel_at_period_end) {
        await patchSubscription(subscription.id, { cancel_at_period_end: false });
      }
      // Polar 상품 즉시 변경 (다음 결제부터 새 가격 적용)
      const res = await patchSubscription(subscription.id, {
        product_id: newProductId,
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json(
          { error: err.detail ?? "Downgrade failed" },
          { status: res.status }
        );
      }

      // DB에는 pending_plan만 저장, 현재 플랜 유지
      await supabaseAdmin
        .from("users")
        .update({ pending_plan: plan })
        .eq("id", user.id);

      return NextResponse.json({ success: true, pending: true });
    }

    // ── 업그레이드 (낮은 플랜 → 높은 플랜) ──
    if (subscription.cancel_at_period_end) {
      await patchSubscription(subscription.id, { cancel_at_period_end: false });
    }
    const res = await patchSubscription(subscription.id, {
      product_id: newProductId,
    });
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: err.detail ?? "Upgrade failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plan change error:", error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
