import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST_PRO = 2;
const CREDIT_COST_ULTRA = 6;

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

  const creditCost = profile.plan === "ultra" ? CREDIT_COST_ULTRA : CREDIT_COST_PRO;

  if (profile.credits < creditCost) {
    return NextResponse.json(
      { error: "Insufficient credits", required: creditCost, current: profile.credits },
      { status: 403 }
    );
  }

  // 3. Parse input
  const { prompt, aspect_ratio, title } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  // 4. Deduct credits first
  const { error: creditError } = await supabaseAdmin
    .from("users")
    .update({ credits: profile.credits - creditCost })
    .eq("id", user.id);

  if (creditError) {
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }

  try {
    // 5. Call Replicate API (model depends on plan)
    const isUltra = profile.plan === "ultra";
    const model = isUltra ? "google/nano-banana" : "minimax/image-01";

    const replicateInput: Record<string, string> = {
      prompt,
      aspect_ratio: aspect_ratio || "1:1",
    };

    const output = await replicate.run(model, { input: replicateInput });

    // 6. Get the file URL from Replicate output
    // minimax/image-01 returns an array, google/nano-banana returns a single FileOutput
    let replicateUrl: string;
    if (isUltra) {
      const fileOutput = output as { url: () => string };
      replicateUrl = fileOutput.url();
    } else {
      const outputArray = output as Array<{ url: () => string }>;
      replicateUrl = outputArray[0].url();
    }

    // 7. Download the file and upload to Supabase Storage
    const imageResponse = await fetch(replicateUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileName = `${user.id}/${Date.now()}.jpeg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({
        url: replicateUrl,
        creditsUsed: creditCost,
        creditsRemaining: profile.credits - creditCost,
      });
    }

    // 8. Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("images")
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;

    // 9. Insert record into images table
    const imageTitle = title || prompt.slice(0, 60);
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from("images")
      .insert({
        user_id: user.id,
        title: imageTitle,
        prompt,
        aspect_ratio: aspect_ratio || "1:1",
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
      image: imageRecord || null,
      creditsUsed: creditCost,
      creditsRemaining: profile.credits - creditCost,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await supabaseAdmin
      .from("users")
      .update({ credits: profile.credits })
      .eq("id", user.id);

    console.error("Image generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Image generation failed", detail: message },
      { status: 500 }
    );
  }
}
