import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "production",
});

const PRODUCT_IDS: Record<string, string> = {
  pro: process.env.POLAR_PRO_PRODUCT_ID!,
  ultra: process.env.POLAR_ULTRA_PRODUCT_ID!,
  credits_100: process.env.POLAR_CREDITS_100_PRODUCT_ID!,
  credits_150: process.env.POLAR_CREDITS_150_PRODUCT_ID!,
  credits_300: process.env.POLAR_CREDITS_300_PRODUCT_ID!,
};

export async function POST(request: Request) {
  const { plan, customerEmail } = await request.json();

  const productId = PRODUCT_IDS[plan];
  if (!productId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      ...(customerEmail && { customerEmail }),
      successUrl: `${new URL(request.url).origin}/dashboard?checkout=success`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: unknown) {
    console.error("Polar checkout error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: message },
      { status: 500 }
    );
  }
}
