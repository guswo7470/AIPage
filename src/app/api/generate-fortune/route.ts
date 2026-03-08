import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FORTUNE_SYSTEM_PROMPT } from "@/lib/fortune-prompt";
import { deductCredits, refundCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

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
  const { birth_date, calendar_type, is_leap_month, birth_time, gender, title } = await request.json();

  if (!birth_date || !calendar_type || !gender) {
    return NextResponse.json(
      { error: "birth_date, calendar_type, and gender are required" },
      { status: 400 }
    );
  }

  // 4. Atomic credit deduction
  const deductResult = await deductCredits(user.id, CREDIT_COST);
  if (deductResult instanceof NextResponse) return deductResult;
  const remainingCredits = deductResult.remaining;

  try {
    // 5. Build user prompt
    const calendarLabel = calendar_type === "lunar" ? "음력" : "양력";
    const leapLabel = is_leap_month ? " (윤달)" : "";
    const timeLabel = birth_time ? birth_time : "모름";
    const genderLabel = gender === "male" ? "남성" : "여성";

    const userPrompt = `다음 정보로 사주팔자를 분석해 주세요:

- 생년월일: ${birth_date} (${calendarLabel}${leapLabel})
- 태어난 시간: ${timeLabel}
- 성별: ${genderLabel}

위 정보를 바탕으로 사주팔자를 정확히 계산하고, 지정된 출력 형식에 맞춰 상세하게 분석해 주세요.`;

    // 6. Call Replicate (Gemini 3 Pro)
    const input = {
      prompt: userPrompt,
      system_prompt: FORTUNE_SYSTEM_PROMPT,
      thinking_level: "low",
    };

    let result = "";
    for await (const event of replicate.stream("google/gemini-3-pro", { input })) {
      result += String(event);
    }

    if (!result.trim()) {
      throw new Error("Empty response from AI");
    }

    // 7. Save to DB
    const fortuneTitle = title || `${birth_date} ${genderLabel} 사주분석`;
    const { data: fortuneRecord, error: dbError } = await supabaseAdmin
      .from("fortunes")
      .insert({
        user_id: user.id,
        title: fortuneTitle,
        birth_date,
        calendar_type,
        is_leap_month: is_leap_month || false,
        birth_time: birth_time || null,
        gender,
        result,
        credits_used: CREDIT_COST,
      })
      .select("id, title, birth_date, calendar_type, gender, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      result,
      fortune: fortuneRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: remainingCredits,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await refundCredits(user.id, CREDIT_COST);

    console.error("Fortune generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Fortune generation failed", detail: message },
      { status: 500 }
    );
  }
}
