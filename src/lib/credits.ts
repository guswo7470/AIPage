import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Atomically deduct credits from a user's account.
 * Returns remaining credits on success, or a NextResponse error on failure.
 */
export async function deductCredits(
  userId: string,
  amount: number
): Promise<{ remaining: number } | NextResponse> {
  const { data: remaining, error } = await supabaseAdmin.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }

  if (remaining === -1) {
    return NextResponse.json(
      { error: "Insufficient credits", required: amount },
      { status: 403 }
    );
  }

  return { remaining };
}

/**
 * Atomically refund credits to a user's account.
 */
export async function refundCredits(
  userId: string,
  amount: number
): Promise<void> {
  await supabaseAdmin.rpc("refund_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
}
