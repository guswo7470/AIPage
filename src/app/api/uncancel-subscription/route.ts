import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const POLAR_API = process.env.POLAR_API_URL || "https://api.polar.sh/v1";
const POLAR_TOKEN = process.env.POLAR_ACCESS_TOKEN!;

async function getCanceledSubscription(email: string) {
  const res = await fetch(`${POLAR_API}/subscriptions/?limit=100`, {
    headers: { Authorization: `Bearer ${POLAR_TOKEN}` },
  });
  const data = await res.json();
  const items = data.items ?? [];
  return items.find(
    (s: any) =>
      s.customer?.email === email &&
      s.status === "active" &&
      s.cancel_at_period_end === true
  );
}

export async function POST() {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email;

  try {
    const subscription = await getCanceledSubscription(email);
    if (!subscription) {
      return NextResponse.json(
        { error: "No canceled subscription found" },
        { status: 404 }
      );
    }

    const res = await fetch(`${POLAR_API}/subscriptions/${subscription.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${POLAR_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_period_end: false }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Polar uncancel error:", err);
      return NextResponse.json(
        { error: err.detail ?? "Uncancel failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Uncancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to uncancel subscription" },
      { status: 500 }
    );
  }
}
