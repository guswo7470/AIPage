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

const CREDIT_COST_PRO = 5;
const CREDIT_COST_ULTRA = 20;

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

  const creditCost = profile.plan === "ultra" ? CREDIT_COST_ULTRA : CREDIT_COST_PRO;

  // 3. Parse input
  const { prompt, lyrics, title } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  // 4. Atomic credit deduction
  const deductResult = await deductCredits(user.id, creditCost);
  if (deductResult instanceof NextResponse) return deductResult;
  const remainingCredits = deductResult.remaining;

  try {
    // 5. Call Replicate API
    const replicateInput: Record<string, string> = { prompt };
    if (lyrics && typeof lyrics === "string" && lyrics.trim()) {
      replicateInput.lyrics = lyrics;
    }

    const isUltra = profile.plan === "ultra";
    const model = isUltra ? "minimax/music-2.5" : "minimax/music-1.5";

    const output = await replicate.run(model, { input: replicateInput });

    // 6. Get the file URL from Replicate output
    const replicateUrl =
      typeof output === "object" && output !== null && "url" in output
        ? (output as { url: () => string }).url()
        : String(output);

    // 7. Download the file and upload to R2
    const audioResponse = await fetch(replicateUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const fileName = `musics/${user.id}/${Date.now()}.mp3`;

    const fileUrl = await uploadToR2(fileName, audioBuffer, "audio/mpeg");

    // 9. Insert record into musics table
    const musicTitle = title || prompt.slice(0, 60);
    const { data: musicRecord, error: dbError } = await supabaseAdmin
      .from("musics")
      .insert({
        user_id: user.id,
        title: musicTitle,
        prompt,
        lyrics: lyrics || null,
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
      music: musicRecord || null,
      creditsUsed: creditCost,
      creditsRemaining: remainingCredits,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await refundCredits(user.id, creditCost);

    console.error("Music generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Music generation failed", detail: message },
      { status: 500 }
    );
  }
}
