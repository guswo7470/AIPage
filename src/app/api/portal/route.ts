import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox",
});

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

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
