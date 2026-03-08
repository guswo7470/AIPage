import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { WRITING_SYSTEM_PROMPT } from "@/lib/writing-prompt";
import { deductCredits, refundCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST = 1;

export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1.5 Rate limiting
  const rateCheck = checkRateLimit(`generate:${user.id}`, 10, 60_000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // 2. Check user plan
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan === "free") {
    return NextResponse.json(
      { error: "Paid plan required" },
      { status: 403 }
    );
  }

  // 3. Parse input
  const { prompt, category, tone, title } = await request.json();

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  // 4. Atomic credit deduction
  const deductResult = await deductCredits(user.id, CREDIT_COST);
  if (deductResult instanceof NextResponse) return deductResult;
  const remainingCredits = deductResult.remaining;

  try {
    // 5. Build user prompt
    const categoryLabels: Record<string, string> = {
      blog: "블로그 포스트",
      marketing: "마케팅 카피",
      email: "이메일",
      report: "보고서",
      story: "스토리/창작",
      general: "일반",
    };

    const toneLabels: Record<string, string> = {
      professional: "전문적",
      casual: "캐주얼",
      friendly: "친근한",
      formal: "격식체",
      creative: "창의적",
      persuasive: "설득력 있는",
    };

    const categoryLabel = categoryLabels[category] || "일반";
    const toneLabel = toneLabels[tone] || "전문적";

    const userPrompt = `다음 요청에 맞는 글을 작성해 주세요:

- 카테고리: ${categoryLabel}
- 톤/스타일: ${toneLabel}
- 요청: ${prompt}

위 요청에 맞게 체계적이고 완성도 높은 글을 작성해 주세요.`;

    // 6. Call Replicate (GPT-5 Nano)
    const input = {
      prompt: `${WRITING_SYSTEM_PROMPT}\n\n${userPrompt}`,
    };

    let result = "";
    for await (const event of replicate.stream("openai/gpt-5-nano", { input })) {
      result += String(event);
    }

    if (!result.trim()) {
      throw new Error("Empty response from AI");
    }

    // 7. Save to DB
    const writingTitle = title || prompt.slice(0, 60);
    const { data: writingRecord, error: dbError } = await supabaseAdmin
      .from("writings")
      .insert({
        user_id: user.id,
        title: writingTitle,
        prompt,
        category: category || "general",
        tone: tone || "professional",
        result,
        credits_used: CREDIT_COST,
      })
      .select("id, title, prompt, category, tone, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      result,
      writing: writingRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: remainingCredits,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await refundCredits(user.id, CREDIT_COST);

    console.error("Writing generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Writing generation failed", detail: message },
      { status: 500 }
    );
  }
}
