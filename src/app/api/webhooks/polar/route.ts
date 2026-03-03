import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PRODUCT_TO_PLAN: Record<string, "pro" | "ultra"> = {
  [process.env.POLAR_PRO_PRODUCT_ID!]: "pro",
  [process.env.POLAR_ULTRA_PRODUCT_ID!]: "ultra",
};

const PLAN_CREDITS: Record<string, number> = { pro: 100, ultra: 300 };

const PRODUCT_TO_CREDITS: Record<string, number> = {
  [process.env.POLAR_CREDITS_100_PRODUCT_ID!]: 100,
  [process.env.POLAR_CREDITS_150_PRODUCT_ID!]: 150,
  [process.env.POLAR_CREDITS_300_PRODUCT_ID!]: 300,
};

function getCreditPackAmount(productId: string): number | null {
  return PRODUCT_TO_CREDITS[productId] ?? null;
}

// ── helpers ──────────────────────────────────────────────

function getPlan(productId: string): "pro" | "ultra" | null {
  return PRODUCT_TO_PLAN[productId] ?? null;
}

async function getUserByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, plan, credits, pending_plan")
    .eq("email", email)
    .single();
  return data;
}

// ── 1. order.paid → 결제 기록 + 크레딧 충전 ─────────────

async function handleOrderPaid(data: any) {
  const email: string | undefined = data.customer?.email;
  if (!email) return;

  const user = await getUserByEmail(email);
  if (!user) return;

  const productId: string | undefined = data.product?.id;
  if (!productId) return;

  // 크레딧 팩 구매 (일회성)
  const creditPackAmount = getCreditPackAmount(productId);
  if (creditPackAmount) {
    await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      plan: "credits",
      amount: data.net_amount ?? data.amount ?? 0,
      currency: data.currency ?? "usd",
      status: "succeeded",
      polar_checkout_id: data.checkout_id ?? data.id,
    });

    await supabaseAdmin
      .from("users")
      .update({ credits: user.credits + creditPackAmount })
      .eq("id", user.id);
    return;
  }

  // 구독 플랜 결제
  const plan = getPlan(productId);
  if (!plan) return;

  await supabaseAdmin.from("payments").insert({
    user_id: user.id,
    plan,
    amount: data.net_amount ?? data.amount ?? 0,
    currency: data.currency ?? "usd",
    status: "succeeded",
    polar_checkout_id: data.checkout_id ?? data.id,
  });

  // pending_plan이 있으면 적용 (다운그레이드 완료)
  // plan은 실제 결제된 상품 기준으로 크레딧 지급
  await supabaseAdmin
    .from("users")
    .update({
      plan,
      credits: user.credits + PLAN_CREDITS[plan],
      pending_plan: null,
    })
    .eq("id", user.id);
}

// ── 2. subscription status → plan / subscription_status ──

async function handleSubscriptionActive(data: any) {
  const email: string | undefined = data.customer?.email;
  if (!email) return;

  const productId: string | undefined = data.product?.id;
  if (!productId) return;

  const plan = getPlan(productId);
  if (!plan) return;

  await supabaseAdmin
    .from("users")
    .update({ plan, subscription_status: "active" })
    .eq("email", email);
}

async function handleSubscriptionCanceled(data: any) {
  const email: string | undefined = data.customer?.email;
  if (!email) return;

  await supabaseAdmin
    .from("users")
    .update({ subscription_status: "canceled" })
    .eq("email", email);
}

async function handleSubscriptionRevoked(data: any) {
  const email: string | undefined = data.customer?.email;
  if (!email) return;

  await supabaseAdmin
    .from("users")
    .update({ plan: "free", subscription_status: "inactive" })
    .eq("email", email);
}

async function handleSubscriptionUncanceled(data: any) {
  const email: string | undefined = data.customer?.email;
  if (!email) return;

  await supabaseAdmin
    .from("users")
    .update({ subscription_status: "active" })
    .eq("email", email);
}

// ── 3. subscription.updated → 업그레이드 / 다운그레이드 ──
// 크레딧은 order.paid 에서만 지급. 여기서는 plan만 변경.
// pending_plan이 있으면 다운그레이드 예약 상태이므로 plan 변경 무시.

async function handleSubscriptionUpdated(data: any) {
  const email: string | undefined = data.customer?.email;
  if (!email) return;

  const productId: string | undefined = data.product?.id;
  if (!productId) return;

  const newPlan = getPlan(productId);
  if (!newPlan) return;

  const user = await getUserByEmail(email);
  if (!user) return;

  // pending_plan이 있으면 다운그레이드 예약 중 → DB plan 변경 안 함
  if (user.pending_plan) return;

  await supabaseAdmin
    .from("users")
    .update({ plan: newPlan })
    .eq("email", email);
}

// ── POST handler ─────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const secret = process.env.POLAR_WEBHOOKS_SECRET!;
  const wh = new Webhook(Buffer.from(secret, "utf-8").toString("base64"));

  let event: any;
  try {
    event = wh.verify(body, headers) as any;
  } catch (e) {
    console.error("Webhook verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  switch (event.type) {
    case "order.paid":
      await handleOrderPaid(event.data);
      break;
    case "subscription.active":
      await handleSubscriptionActive(event.data);
      break;
    case "subscription.canceled":
      await handleSubscriptionCanceled(event.data);
      break;
    case "subscription.revoked":
      await handleSubscriptionRevoked(event.data);
      break;
    case "subscription.uncanceled":
      await handleSubscriptionUncanceled(event.data);
      break;
    case "subscription.updated":
      await handleSubscriptionUpdated(event.data);
      break;
  }

  return NextResponse.json({ received: true });
}
