import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { createClient } from "@/lib/supabase/server";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "production",
});

export async function POST() {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email;

  try {
    // Find customer by email
    const customers = await polar.customers.list({ email });
    const customer = customers.result.items[0];

    if (!customer) {
      return NextResponse.json(
        { error: "No customer found for this email" },
        { status: 404 }
      );
    }

    // Create authenticated customer portal session
    const session = await polar.customerSessions.create({
      customerId: customer.id,
    });

    return NextResponse.json({ url: session.customerPortalUrl });
  } catch (error) {
    console.error("Portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
