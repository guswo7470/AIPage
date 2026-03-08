import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { uploadToR2 } from "@/lib/r2";
import {
  DOCUMENT_PDF_PROMPT,
  DOCUMENT_EXCEL_PROMPT,
  DOCUMENT_PPT_PROMPT,
  DOCUMENT_WORD_PROMPT,
} from "@/lib/document-prompt";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const CREDIT_COST = 5;

const SYSTEM_PROMPTS: Record<string, string> = {
  pdf: DOCUMENT_PDF_PROMPT,
  excel: DOCUMENT_EXCEL_PROMPT,
  ppt: DOCUMENT_PPT_PROMPT,
  word: DOCUMENT_WORD_PROMPT,
};

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF 문서",
  excel: "Excel 스프레드시트",
  ppt: "PowerPoint 프레젠테이션",
  word: "Word 문서",
};

async function generatePdfBuffer(markdownContent: string, title: string): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 25;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 10;

  // Body
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const lines = markdownContent.split("\n");
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const wrapped = doc.splitTextToSize(trimmed.replace(/^#+ /, ""), maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 7 + 6;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
    } else if (trimmed.startsWith("## ")) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const wrapped = doc.splitTextToSize(trimmed.replace(/^#+ /, ""), maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 6 + 5;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
    } else if (trimmed.startsWith("### ")) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const wrapped = doc.splitTextToSize(trimmed.replace(/^#+ /, ""), maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5.5 + 4;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[-*] /, "");
      const cleaned = bulletText.replace(/\*\*/g, "").replace(/\*/g, "");
      const wrapped = doc.splitTextToSize(cleaned, maxWidth - 8);
      doc.text("\u2022", margin + 2, y);
      doc.text(wrapped, margin + 8, y);
      y += wrapped.length * 5 + 2;
    } else if (trimmed === "") {
      y += 4;
    } else {
      const cleaned = trimmed.replace(/\*\*/g, "").replace(/\*/g, "");
      const wrapped = doc.splitTextToSize(cleaned, maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 2;
    }
  }

  return Buffer.from(doc.output("arraybuffer"));
}

async function generateExcelBuffer(jsonContent: string): Promise<Buffer> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  let data: { title?: string; sheets?: Array<{ name: string; headers: string[]; rows: (string | number)[][] }> };
  try {
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/) || jsonContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : jsonContent;
    data = JSON.parse(jsonStr);
  } catch {
    // Fallback: treat as plain text in a single cell
    const sheet = workbook.addWorksheet("Sheet1");
    sheet.addRow(["Content"]);
    sheet.addRow([jsonContent]);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  if (data.sheets) {
    for (const sheetData of data.sheets) {
      const sheet = workbook.addWorksheet(sheetData.name || "Sheet");

      // Headers
      if (sheetData.headers) {
        const headerRow = sheet.addRow(sheetData.headers);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
          cell.alignment = { horizontal: "center" };
        });
      }

      // Rows
      if (sheetData.rows) {
        for (const row of sheetData.rows) {
          sheet.addRow(row);
        }
      }

      // Auto-fit column widths
      sheet.columns.forEach((col) => {
        let maxLen = 10;
        col.eachCell?.({ includeEmpty: false }, (cell) => {
          const len = String(cell.value || "").length;
          if (len > maxLen) maxLen = len;
        });
        col.width = Math.min(maxLen + 2, 40);
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function generatePptBuffer(jsonContent: string): Promise<Buffer> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  let data: { title?: string; slides?: Array<{ title: string; content: string[]; notes?: string }> };
  try {
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/) || jsonContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : jsonContent;
    data = JSON.parse(jsonStr);
  } catch {
    // Fallback: single slide with content
    const slide = pptx.addSlide();
    slide.addText("Generated Document", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true });
    slide.addText(jsonContent.slice(0, 2000), { x: 0.5, y: 1.8, w: 9, h: 4.5, fontSize: 14 });
    const output = await pptx.write({ outputType: "nodebuffer" });
    return Buffer.from(output as ArrayBuffer);
  }

  if (data.slides) {
    for (let i = 0; i < data.slides.length; i++) {
      const slideData = data.slides[i];
      const slide = pptx.addSlide();

      if (i === 0) {
        // Title slide
        slide.addText(slideData.title || data.title || "", {
          x: 0.5, y: 1.5, w: 9, h: 2, fontSize: 32, bold: true, align: "center", color: "1F2937",
        });
        if (slideData.content?.length > 0) {
          slide.addText(slideData.content[0], {
            x: 1, y: 3.8, w: 8, h: 1, fontSize: 16, align: "center", color: "6B7280",
          });
        }
      } else {
        // Content slide
        slide.addText(slideData.title || "", {
          x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 22, bold: true, color: "1F2937",
        });

        if (slideData.content) {
          const bulletPoints = slideData.content.map((point) => ({
            text: point,
            options: { bullet: true, fontSize: 16, color: "374151" as const, breakLine: true },
          }));
          slide.addText(bulletPoints, { x: 0.8, y: 1.4, w: 8.4, h: 4, valign: "top" as const, lineSpacingMultiple: 1.5 });
        }
      }

      if (slideData.notes) {
        slide.addNotes(slideData.notes);
      }
    }
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(output as ArrayBuffer);
}

async function generateWordBuffer(markdownContent: string, title: string): Promise<Buffer> {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

  const children: (typeof Paragraph.prototype)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  const lines = markdownContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^# /, ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^## /, ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 250, after: 120 },
        })
      );
    } else if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^### /, ""),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.replace(/^[-*] /, "").replace(/\*\*/g, "").replace(/\*/g, "");
      children.push(
        new Paragraph({
          children: [new TextRun({ text })],
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
    } else if (trimmed === "") {
      children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
    } else {
      // Handle bold (**text**) in regular paragraphs
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const runs = parts.map((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return new TextRun({ text: part.slice(2, -2), bold: true });
        }
        return new TextRun({ text: part.replace(/\*/g, "") });
      });
      children.push(
        new Paragraph({ children: runs, spacing: { after: 80 } })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

const FILE_EXTENSIONS: Record<string, string> = {
  pdf: "pdf",
  excel: "xlsx",
  ppt: "pptx",
  word: "docx",
};

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const MAX_REFERENCE_LENGTH = 15000; // Limit reference text to avoid excessive token usage

async function extractTextFromFile(base64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  // Plain text / CSV
  if (mimeType === "text/plain" || mimeType === "text/csv" || mimeType === "text/markdown") {
    return buffer.toString("utf-8").slice(0, MAX_REFERENCE_LENGTH);
  }

  // PDF
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return (result.text || "").slice(0, MAX_REFERENCE_LENGTH);
  }

  // DOCX
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").slice(0, MAX_REFERENCE_LENGTH);
  }

  // XLSX
  if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const parts: string[] = [];
    workbook.eachSheet((sheet) => {
      parts.push(`[${sheet.name}]`);
      sheet.eachRow((row) => {
        const cells = (row.values as (string | number | null)[]).slice(1).map((v) => String(v ?? ""));
        parts.push(cells.join("\t"));
      });
      parts.push("");
    });
    return parts.join("\n").slice(0, MAX_REFERENCE_LENGTH);
  }

  return "";
}

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
  const { prompt, documentType, title, fileBase64, fileMimeType } = await request.json();

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  const validTypes = ["pdf", "excel", "ppt", "word"];
  const docType = validTypes.includes(documentType) ? documentType : "pdf";

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
    // 5. Extract reference file text (if provided)
    let referenceText = "";
    if (fileBase64 && fileMimeType) {
      try {
        referenceText = await extractTextFromFile(fileBase64, fileMimeType);
      } catch (e) {
        console.error("File text extraction error:", e);
        // Continue without reference - don't fail the whole request
      }
    }

    // 6. Build prompt
    const systemPrompt = SYSTEM_PROMPTS[docType] || SYSTEM_PROMPTS.pdf;
    const typeLabel = TYPE_LABELS[docType] || "PDF 문서";

    const referenceSection = referenceText
      ? `\n\n--- 참고 자료 ---\n아래는 사용자가 첨부한 참고 파일의 내용입니다. 이 내용을 참고하여 문서를 작성해 주세요:\n\n${referenceText}\n--- 참고 자료 끝 ---\n`
      : "";

    const userPrompt = `다음 요청에 맞는 ${typeLabel}를 작성해 주세요:

- 문서 유형: ${typeLabel}
- 요청: ${prompt}
${referenceSection}
위 요청에 맞게 전문적이고 완성도 높은 문서를 작성해 주세요.`;

    // 6. Call Replicate (Claude Opus 4.6)
    const input = {
      prompt: `${systemPrompt}\n\n${userPrompt}`,
    };

    let result = "";
    for await (const event of replicate.stream("anthropic/claude-opus-4.6", { input })) {
      result += String(event);
    }

    if (!result.trim()) {
      throw new Error("Empty response from AI");
    }

    // 7. Convert to file
    let fileBuffer: Buffer;
    switch (docType) {
      case "pdf":
        fileBuffer = await generatePdfBuffer(result, title || prompt.slice(0, 60));
        break;
      case "excel":
        fileBuffer = await generateExcelBuffer(result);
        break;
      case "ppt":
        fileBuffer = await generatePptBuffer(result);
        break;
      case "word":
        fileBuffer = await generateWordBuffer(result, title || prompt.slice(0, 60));
        break;
      default:
        fileBuffer = await generatePdfBuffer(result, title || prompt.slice(0, 60));
    }

    // 8. Upload to R2
    const ext = FILE_EXTENSIONS[docType] || "pdf";
    const mimeType = MIME_TYPES[docType] || "application/pdf";
    const fileName = `documents/${user.id}/${Date.now()}.${ext}`;

    const fileUrl = await uploadToR2(fileName, fileBuffer, mimeType);
    const filePath = fileName;

    // 9. Save to DB
    const docTitle = title || prompt.slice(0, 60);
    const { data: documentRecord, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: user.id,
        title: docTitle,
        prompt,
        document_type: docType,
        result,
        file_path: filePath,
        file_url: fileUrl,
        credits_used: CREDIT_COST,
      })
      .select("id, title, prompt, document_type, file_url, created_at")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      result,
      fileUrl,
      document: documentRecord || null,
      creditsUsed: CREDIT_COST,
      creditsRemaining: profile.credits - CREDIT_COST,
    });
  } catch (error: unknown) {
    // Refund credits on failure
    await supabaseAdmin
      .from("users")
      .update({ credits: profile.credits })
      .eq("id", user.id);

    console.error("Document generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Document generation failed", detail: message },
      { status: 500 }
    );
  }
}
