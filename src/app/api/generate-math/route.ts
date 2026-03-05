import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MATH_SYSTEM_PROMPT } from "@/lib/math-prompt";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  // 3. Parse input (supports text or image)
  const { problemText, imageBase64, mimeType, title } = await request.json();

  const hasText = problemText && problemText.trim();
  const hasImage = imageBase64 && mimeType;

  if (!hasText && !hasImage) {
    return NextResponse.json(
      { error: "problemText or imageBase64+mimeType is required" },
      { status: 400 }
    );
  }

  // Validate image if provided
  if (hasImage) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image type" },
        { status: 400 }
      );
    }

    const estimatedBytes = (imageBase64.length * 3) / 4;
    if (estimatedBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }
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
    let imageUrl: string | null = null;
    let imagePath: string | null = null;
    const inputType = hasImage ? "image" : "text";

    // 5. Upload image to Supabase Storage (if image mode)
    if (hasImage) {
      const ext = mimeType.split("/")[1];
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const imageBuffer = Buffer.from(imageBase64, "base64");

      const { error: uploadError } = await supabaseAdmin.storage
        .from("math-images")
        .upload(fileName, imageBuffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("math-images")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
      imagePath = fileName;
    }

    // 6. Build prompt and call Replicate (Gemini 3 Pro)
    const userPrompt = hasImage
      ? "이 수학 문제 사진을 분석하여 단계별로 풀이해 주세요."
      : `다음 수학 문제를 단계별로 풀이해 주세요:\n\n${problemText}`;

    const input: Record<string, string> = {
      prompt: `${MATH_SYSTEM_PROMPT}\n\n${userPrompt}`,
    };

    if (imageUrl) {
      input.image = imageUrl;
    }

    let result = "";
    for await (const event of replicate.stream("google/gemini-3-pro", { input })) {
      result += String(event);
    }

    if (!result.trim()) {
      throw new Error("Empty response from AI");
    }

    // 7. Save to DB
    const mathTitle = title || (hasText ? problemText.slice(0, 60) : `수학 풀이 ${new Date().toLocaleDateString("ko-KR")}`);
    const { data: mathRecord, error: dbError } = await supabaseAdmin
      .from("math_solutions")
      .insert({
        user_id: user.id,
        title: mathTitle,
        input_type: inputType,
        problem_text: hasText ? problemText : null,
        image_path: imagePath,
        image_url: imageUrl,
        result,
        credits_used: CREDIT_COST,
      })
      .select("id, title, input_type, image_url, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      result,
      imageUrl,
      mathSolution: mathRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: profile.credits - CREDIT_COST,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await supabaseAdmin
      .from("users")
      .update({ credits: profile.credits })
      .eq("id", user.id);

    console.error("Math solving error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Math solving failed", detail: message },
      { status: 500 }
    );
  }
}
