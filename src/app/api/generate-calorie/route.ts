import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CALORIE_SYSTEM_PROMPT } from "@/lib/calorie-prompt";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST = 3;
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

  // 3. Parse input
  const { imageBase64, mimeType, title } = await request.json();

  if (!imageBase64 || !mimeType) {
    return NextResponse.json(
      { error: "imageBase64 and mimeType are required" },
      { status: 400 }
    );
  }

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
    // 5. Upload image to Supabase Storage
    const ext = mimeType.split("/")[1];
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    const { error: uploadError } = await supabaseAdmin.storage
      .from("food-images")
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("food-images")
      .getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    // 7. Call Replicate (GPT-5 with vision)
    const userPrompt = "이 음식 사진을 분석하여 칼로리와 영양 정보를 알려주세요.";
    const input = {
      prompt: `${CALORIE_SYSTEM_PROMPT}\n\n${userPrompt}`,
      image: imageUrl,
    };

    let result = "";
    for await (const event of replicate.stream("openai/gpt-5", { input })) {
      result += String(event);
    }

    if (!result.trim()) {
      throw new Error("Empty response from AI");
    }

    // 8. Extract food name from result for sidebar display
    const foodNameMatch = result.match(/[-*]\s*\*?\*?([^*\n]+)\*?\*?/);
    const foodName = foodNameMatch ? foodNameMatch[1].trim().slice(0, 60) : null;

    // 9. Save to DB
    const calorieTitle = title || foodName || `음식 분석 ${new Date().toLocaleDateString("ko-KR")}`;
    const { data: calorieRecord, error: dbError } = await supabaseAdmin
      .from("calories")
      .insert({
        user_id: user.id,
        title: calorieTitle,
        food_name: foodName,
        image_path: fileName,
        image_url: imageUrl,
        result,
        credits_used: CREDIT_COST,
      })
      .select("id, title, food_name, image_url, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      result,
      imageUrl,
      calorie: calorieRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: profile.credits - CREDIT_COST,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await supabaseAdmin
      .from("users")
      .update({ credits: profile.credits })
      .eq("id", user.id);

    console.error("Calorie analysis error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Calorie analysis failed", detail: message },
      { status: 500 }
    );
  }
}
