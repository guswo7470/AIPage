import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
  const { prompt, lyrics, title } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt is required" },
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
    // 5. Call Replicate API
    const replicateInput: Record<string, string> = { prompt };
    if (lyrics && typeof lyrics === "string" && lyrics.trim()) {
      replicateInput.lyrics = lyrics;
    }

    const output = await replicate.run("minimax/music-1.5", { input: replicateInput });

    // 6. Get the file URL from Replicate output
    const replicateUrl =
      typeof output === "object" && output !== null && "url" in output
        ? (output as { url: () => string }).url()
        : String(output);

    // 7. Download the file and upload to Supabase Storage
    const audioResponse = await fetch(replicateUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const fileName = `${user.id}/${Date.now()}.mp3`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("musics")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({
        url: replicateUrl,
        creditsUsed: CREDIT_COST,
        creditsRemaining: profile.credits - CREDIT_COST,
      });
    }

    // 8. Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("musics")
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;

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
        credits_used: CREDIT_COST,
      })
      .select("id, title, file_url, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      url: fileUrl,
      music: musicRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: profile.credits - CREDIT_COST,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await supabaseAdmin
      .from("users")
      .update({ credits: profile.credits })
      .eq("id", user.id);

    console.error("Music generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Music generation failed", detail: message },
      { status: 500 }
    );
  }
}
