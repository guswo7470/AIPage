import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CODE_SYSTEM_PROMPT } from "@/lib/code-prompt";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST = 5;

export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check user plan & credits
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan, credits")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return NextResponse.json(
      { error: "Paid plan required" },
      { status: 403 }
    );
  }

  if (profile.credits < CREDIT_COST) {
    return NextResponse.json(
      { error: "Insufficient credits", required: CREDIT_COST, current: profile.credits },
      { status: 403 }
    );
  }

  // 3. Parse input
  const { prompt, language, title } = await request.json();

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  // 4. Deduct credits first
  const { error: creditError } = await supabaseAdmin
    .from("users")
    .update({ credits: profile.credits - CREDIT_COST })
    .eq("id", user.id);

  if (creditError) {
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }

  try {
    // 5. Build user prompt
    const langLabel = language && language !== "auto" ? language : "가장 적합한 언어";

    const userPrompt = `다음 요청에 맞는 코드를 작성해 주세요:

- 프로그래밍 언어: ${langLabel}
- 요청: ${prompt}

위 요청에 맞게 깔끔하고 실행 가능한 코드를 작성해 주세요.`;

    // 6. Call Replicate (Claude 4.5 Sonnet)
    const input = {
      prompt: userPrompt,
      system_prompt: CODE_SYSTEM_PROMPT,
    };

    let result = "";
    for await (const event of replicate.stream("anthropic/claude-4.5-sonnet", { input })) {
      result += String(event);
    }

    if (!result.trim()) {
      throw new Error("Empty response from AI");
    }

    // 7. Save to DB
    const codeTitle = title || prompt.slice(0, 60);
    const { data: codeRecord, error: dbError } = await supabaseAdmin
      .from("codes")
      .insert({
        user_id: user.id,
        title: codeTitle,
        prompt,
        language: language || "auto",
        result,
        credits_used: CREDIT_COST,
      })
      .select("id, title, prompt, language, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      result,
      code: codeRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: profile.credits - CREDIT_COST,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await supabaseAdmin
      .from("users")
      .update({ credits: profile.credits })
      .eq("id", user.id);

    console.error("Code generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Code generation failed", detail: message },
      { status: 500 }
    );
  }
}
