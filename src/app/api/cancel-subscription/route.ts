import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const POLAR_API = process.env.POLAR_API_URL || "https://api.polar.sh/v1";
const POLAR_TOKEN = process.env.POLAR_ACCESS_TOKEN!;

async function getActiveSubscription(email: string) {
  const res = await fetch(`${POLAR_API}/subscriptions/?active=true`, {
    headers: { Authorization: `Bearer ${POLAR_TOKEN}` },
  });
  const data = await res.json();
  const items = data.items ?? [];
  return items.find(
    (s: any) => s.customer?.email === email && s.status === "active"
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
    const subscription = await getActiveSubscription(email);
    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel at period end (not immediately)
    const res = await fetch(`${POLAR_API}/subscriptions/${subscription.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${POLAR_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_period_end: true }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Polar cancel error:", err);
      return NextResponse.json(
        { error: err.detail ?? "Cancel failed" },
        { status: res.status }
      );
    }

    const updated = await res.json();
    return NextResponse.json({
      success: true,
      endsAt: updated.current_period_end ?? updated.ends_at,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
