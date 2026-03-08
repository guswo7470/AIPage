import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { uploadToR2 } from "@/lib/r2";
import { deductCredits, refundCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST_PRO_AUDIO = 30;
const CREDIT_COST_PRO_NO_AUDIO = 20;
const CREDIT_COST_ULTRA_AUDIO = 80;
const CREDIT_COST_ULTRA_NO_AUDIO = 40;

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
  const { prompt, title, generate_audio = true } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  // 4. Calculate credit cost based on plan and audio option
  const isUltraPlan = profile.plan === "ultra";
  const creditCost = isUltraPlan
    ? (generate_audio ? CREDIT_COST_ULTRA_AUDIO : CREDIT_COST_ULTRA_NO_AUDIO)
    : (generate_audio ? CREDIT_COST_PRO_AUDIO : CREDIT_COST_PRO_NO_AUDIO);

  // 5. Atomic credit deduction
  const deductResult = await deductCredits(user.id, creditCost);
  if (deductResult instanceof NextResponse) return deductResult;
  const remainingCredits = deductResult.remaining;

  try {
    // 6. Call Replicate API (model depends on plan)
    const model = isUltraPlan ? "google/veo-3.1" : "google/veo-3-fast";

    const output = await replicate.run(model, {
      input: { prompt, generate_audio: !!generate_audio },
    });

    // 7. Get the file URL from Replicate output
    const outputFile = output as { url: () => string };
    const replicateUrl = outputFile.url();

    // 8. Download the file and upload to R2
    const videoResponse = await fetch(replicateUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    const fileName = `videos/${user.id}/${Date.now()}.mp4`;

    const fileUrl = await uploadToR2(fileName, videoBuffer, "video/mp4");

    // 10. Insert record into videos table
    const videoTitle = title || prompt.slice(0, 60);
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from("videos")
      .insert({
        user_id: user.id,
        title: videoTitle,
        prompt,
        file_path: fileName,
        file_url: fileUrl,
        credits_used: creditCost,
      })
      .select("id, title, file_url, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      url: fileUrl,
      video: videoRecord || null,
      creditsUsed: creditCost,
      creditsRemaining: remainingCredits,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await refundCredits(user.id, creditCost);

    console.error("Video generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Video generation failed", detail: message },
      { status: 500 }
    );
  }
}
