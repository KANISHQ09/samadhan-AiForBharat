// @ts-ignore: Deno imports are not supported in standard Node projects
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

declare const Deno: any;

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";
const EMBED_MODEL  = "nvidia/llama-nemotron-embed-1b-v2";
const GEN_MODEL    = "meta/llama-3.1-8b-instruct";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter (per Edge Function instance) — keeps things
// fast and avoids a DB round trip just to throttle requests.
const requestLog = new Map<string, number[]>();
function isRateLimited(ip: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(t => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > limit;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // ── 0. Lightweight abuse guard (no user auth needed — public KB) ──
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return errorResponse("Too many requests. Please wait a moment and try again.", 429);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Supabase configuration missing on the server.", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 1. Parse request body ──────────────────────────────────────
    const body = await req.json();
    const { fileBase64, mimeType, userQuery } = body;

    if (!fileBase64 || !mimeType) {
      return errorResponse("fileBase64 and mimeType are required", 400);
    }

    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(mimeType)) {
      return errorResponse("Only PDF, JPEG, PNG, or WebP files are accepted", 400);
    }

    // File is NEVER written to st    // ── 2. STEP 1: Government Gate — VLM Classification ───────────
    const classificationPrompt = `You are an expert Indian Government document classifier, quality auditor, and fraud detection assistant.
Your task is to analyze the provided image/PDF and determine its relation to Indian government documents/forms, check its authenticity (detecting if it is original, a fake/tampered document, a blank sample/template, or suspicious), and identify if it is a recognized government application form.

Respond ONLY with a valid JSON object. No preamble, no explanation, no markdown formatting (do NOT wrap the JSON in \`\`\`json).

Step-by-Step Analysis Guide for your response:
1. visualAnalysis: Describe in detail what you see in the image (e.g., "A photograph of a valley with mountains", "A scanned Aadhaar Card", "An official printed form titled PM-KISAN application", or "A blank white sheet").
2. documentType: Categorize the image content. Supported values: "application_form", "id_card", "receipt", "utility_bill", "certificate", "photograph", "artwork", "screenshot_non_document", "other_document", "empty_canvas", "unknown".
3. isGovernmentRelated: Set to true if the document/image is directly related to the Indian Central or State Government, its schemes, official identification, departments, or portals (e.g., Aadhaar Card, PAN Card, PMAY application, e-District portal screenshot, government letters, certificates, etc.). Set to false if it is a private document (e.g., restaurant bill, private invoice, school ID) or not a document at all (e.g., landscape photo, family photo).
4. authenticity: Classify the authenticity of this document. Supported values:
   - "original": A filled, stamped, signed, or standard printed official document/form showing no obvious signs of digital manipulation, counterfeiting, or sample watermarks.
   - "fake": Obviously falsified, containing counterfeit elements, or manipulated metadata/text.
   - "sample_or_template": A blank template, example form, specimen copy, draft, or demo copy (often containing watermarks like "SAMPLE" or "SPECIMEN" or completely empty fields).
   - "suspicious": Contains anomalies, mismatched fonts, overlay text that looks pasted, blurred areas over sensitive details, or signatures/stamps that seem digitally edited/copied.
   - "not_applicable": For photographs, illustrations, drawings, or non-government private items where government authenticity is not relevant.
5. authenticityReason: Explain clearly and objectively why you classified it under that authenticity status. Mention specific visual clues (e.g., "Contains official state emblem, standard printed layout", "Clearly marked with a diagonal 'SAMPLE COPY' watermark", "Contains digitally pasted/unaligned text fields suggesting tampering", "Not a government document").
6. isGovernmentForm: Set to true ONLY if the document is a printed or digital Indian government application, enrollment, or registration form (e.g., PMAY application form, Aadhaar update form, PM-Kisan form, etc.). If it is a standalone ID card (like Aadhaar card on its own, PAN card on its own), a certificate, or a bill, set this to false.
7. formCode:
   - If isGovernmentForm is true and it matches one of these codes: "PMAY-U", "PMAY-G", "PM-KISAN", "AADHAAR-UPDATE", "AADHAAR-ENROLLMENT", "AYUSHMAN-BHARAT", "PM-SVANidhi", "NREGA-JOB-CARD", "SCHOLARSHIP-NSP", "INCOME-CERT".
   - If it is a government form but NOT in the list above, use "UNKNOWN-GOVT".
   - If it is not a government form, use "NOT-A-FORM".
8. confidence: A float between 0.0 and 1.0 representing your certainty of this entire classification.
9. detectedFormName: The human-readable name of the form/document if detected (e.g., "Pradhan Mantri Awas Yojana Urban Application Form"), or null.
10. isValid: Set to true if the document is a recognized, valid government form that can be processed for guidelines (i.e. isGovernmentForm is true and formCode is NOT "NOT-A-FORM" and formCode is NOT "UNKNOWN-GOVT"). Otherwise, set to false.
11. rejectionReason: Detailed reason why the document is not a valid recognized form (or null if isValid is true).

Respond with EXACTLY this JSON structure:
{
  "visualAnalysis": "string",
  "documentType": "application_form" | "id_card" | "receipt" | "utility_bill" | "certificate" | "photograph" | "artwork" | "screenshot_non_document" | "other_document" | "empty_canvas" | "unknown",
  "isGovernmentRelated": boolean,
  "authenticity": "original" | "fake" | "sample_or_template" | "suspicious" | "not_applicable",
  "authenticityReason": "string",
  "isGovernmentForm": boolean,
  "formCode": "PMAY-U" | "PMAY-G" | "PM-KISAN" | "AADHAAR-UPDATE" | "AADHAAR-ENROLLMENT" | "AYUSHMAN-BHARAT" | "PM-SVANidhi" | "NREGA-JOB-CARD" | "SCHOLARSHIP-NSP" | "INCOME-CERT" | "UNKNOWN-GOVT" | "NOT-A-FORM",
  "confidence": float,
  "detectedFormName": "string or null",
  "isValid": boolean,
  "rejectionReason": "string or null"
}`;

    const visionResponse = await callNvidiaNIM(VISION_MODEL, [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${fileBase64}` }
          },
          { type: "text", text: classificationPrompt }
        ]
      }
    ]);

    let classification;
    const rawText = visionResponse.choices[0].message.content;
    console.log("VLM RAW CLASSIFICATION:", rawText);
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      classification = JSON.parse(jsonMatch![0]);
    } catch (e) {
      console.error("Parse error of VLM output:", visionResponse, e);
      return errorResponse("Failed to parse document classification from the vision model.", 500);
    }

    // ── 3. Enforce strictness gate ────────────────────────────────
    // Hard override to prevent logical contradictions (e.g. non-government classified as a form)
    if (classification.isGovernmentRelated === false) {
      classification.isGovernmentForm = false;
      classification.isValid = false;
      classification.formCode = "NOT-A-FORM";
      if (!classification.rejectionReason) {
        classification.rejectionReason = "This document is not related to the Indian government.";
      }
    }

    if (!classification.isGovernmentForm || !classification.isValid) {
      return jsonResponse({
        status: "rejected",
        reason: classification.rejectionReason || "This does not appear to be a recognized Indian government form.",
        confidence: classification.confidence,
        isGovernmentRelated: classification.isGovernmentRelated ?? false,
        authenticity: classification.authenticity ?? "not_applicable",
        authenticityReason: classification.authenticityReason ?? "",
        visualAnalysis: classification.visualAnalysis ?? "",
        documentType: classification.documentType ?? "unknown",
        guidance: "Please upload the original printed government form (PDF or clear photo). Examples: PMAY application form, PM-Kisan registration, Aadhaar update form."
      });
    }

    if (classification.confidence < 0.70) {
      return jsonResponse({
        status: "low_confidence",
        reason: `Document recognized as ${classification.detectedFormName || "a government form"} but image quality is too low (confidence: ${(classification.confidence * 100).toFixed(0)}%).`,
        confidence: classification.confidence,
        isGovernmentRelated: classification.isGovernmentRelated ?? false,
        authenticity: classification.authenticity ?? "not_applicable",
        authenticityReason: classification.authenticityReason ?? "",
        visualAnalysis: classification.visualAnalysis ?? "",
        documentType: classification.documentType ?? "unknown",
        guidance: "Please upload a clearer scan or photo. Ensure good lighting, no blurring, and the full form is visible."
      });
    }

    if (classification.formCode === "UNKNOWN-GOVT") {
      return jsonResponse({
        status: "unsupported_form",
        reason: "This appears to be a government form, but it is not in our knowledge base yet.",
        detectedFormName: classification.detectedFormName,
        confidence: classification.confidence,
        isGovernmentRelated: classification.isGovernmentRelated ?? false,
        authenticity: classification.authenticity ?? "not_applicable",
        authenticityReason: classification.authenticityReason ?? "",
        visualAnalysis: classification.visualAnalysis ?? "",
        documentType: classification.documentType ?? "unknown",
        guidance: "Currently supported forms: PMAY, PM-Kisan, Aadhaar Update/Enrollment, Ayushman Bharat, PM SVANidhi, NREGA Job Card, NSP Scholarship, Income Certificate."
      });
    }

    // ── 4. Fetch form metadata directly from DB (single query, new project) ──
    const { data: formMeta, error: formError } = await supabase
      .from("form_knowledge_base")
      .select("id, form_code, form_name, source_url, version, last_verified_at")
      .eq("form_code", classification.formCode)
      .single();

    if (formError || !formMeta) {
      return errorResponse(`Form ${classification.formCode} not found in knowledge base`, 404);
    }

    // ── 5. STEP 2: Embed the RAG query ────────────────────────────
    const ragQuery = userQuery
      ? `${formMeta.form_name}: ${userQuery}`
      : `${formMeta.form_name} eligibility documents required steps submission how to fill`;

    const embedResponse = await fetch(`${NVIDIA_BASE}/embeddings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("NVIDIA_NIM_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: [ragQuery],
        input_type: "query",
        truncate: "END"
      })
    });

    if (!embedResponse.ok) {
      throw new Error(`Embedding request failed: ${embedResponse.status} ${await embedResponse.text()}`);
    }

    const embedData = await embedResponse.json();
    // Slice to 1024 dimensions (Matryoshka representation learning support) to fit pgvector HNSW limits
    const queryEmbedding = embedData.data[0].embedding.slice(0, 1024); // float[1024]

    // ── 6. STEP 3: RAG — retrieve filtered chunks directly via RPC ────
    const { data: chunks, error: chunkError } = await supabase
      .rpc("match_form_chunks", {
        query_embedding: queryEmbedding,
        target_form_id: formMeta.id,
        match_threshold: 0.30,   // lowered from 0.65 — passage/query gap in NV-Embed-QA
        match_count: 8
      });

    // Fallback: if RPC returns nothing (threshold too strict), just grab all chunks for the form
    let finalChunks = chunks;
    if (chunkError || !chunks || chunks.length === 0) {
      console.warn("RPC returned no chunks (threshold miss), falling back to direct fetch", chunkError);
      const { data: fallbackChunks, error: fbError } = await supabase
        .from("form_chunks")
        .select("id, chunk_title, chunk_content, chunk_type")
        .eq("form_id", formMeta.id)
        .limit(8);

      if (fbError || !fallbackChunks || fallbackChunks.length === 0) {
        return errorResponse("Could not retrieve knowledge chunks for this form", 500);
      }
      // Attach a dummy similarity so downstream code works uniformly
      finalChunks = fallbackChunks.map((c: any) => ({ ...c, similarity: 0.5 }));
    }

    // Group chunks by type for structured context
    const chunksByType: Record<string, string[]> = {};
    for (const chunk of finalChunks) {
      if (!chunksByType[chunk.chunk_type]) chunksByType[chunk.chunk_type] = [];
      chunksByType[chunk.chunk_type].push(`### ${chunk.chunk_title}\n${chunk.chunk_content}`);
    }

    // ── 7. STEP 4: Generate structured guidance in the SIMPLEST language ──
    const systemPrompt = `You are Samadhan's Government Form Expert AI. You help Indian citizens — including first-time form fillers with no prior experience — understand and fill government forms.

You have been given verified knowledge chunks from official government sources. Use ONLY this information. Do not invent details.

Write every explanation in the simplest possible everyday language. Avoid bureaucratic or legal jargon. Imagine you are explaining this to someone filling out a government form for the very first time in their life. Short sentences. Concrete examples wherever possible.

Respond ONLY with a valid JSON object. No markdown, no preamble.

JSON structure:
{
  "summary": "2-3 sentence plain explanation of what this form is for, in the simplest words possible",
  "scheme_benefit": "what benefit/service the citizen gets by submitting this, in plain words",
  "eligibility": ["criterion 1 in plain words", "criterion 2 in plain words", ...],
  "required_documents": [
    { "name": "Document Name", "details": "why needed / variations accepted, in plain words" }
  ],
  "filling_steps": [
    { "step": 1, "field": "Field Name on Form", "instruction": "how to fill this field, in plain words", "example": "example value or null" }
  ],
  "submission": {
    "where": "where to submit physically",
    "online_portal": "URL of online submission portal or null",
    "deadline": "deadline info or null",
    "fee": "application fee or 'Free'"
  },
  "important_notes": ["note 1 in plain words", "note 2 in plain words"],
  "custom_query_answer": "direct, helpful, and concise (2-3 sentences) answer to the citizen's specific question, or null if no question was asked"
}

Specific rules for "custom_query_answer":
1. If the CITIZEN'S SPECIFIC QUESTION is provided, you MUST answer it directly and accurately based ONLY on the provided verified context.
2. If the context does not contain the answer to the specific question, set "custom_query_answer" to: "The verified guide for this form does not mention this specific information."
3. If no CITIZEN'S SPECIFIC QUESTION is provided, you MUST set "custom_query_answer" to null.`;

    const contextText = Object.entries(chunksByType)
      .map(([type, texts]) => `## ${type.toUpperCase()} INFORMATION\n${texts.join("\n\n")}`)
      .join("\n\n---\n\n");

    const userPrompt = `FORM IDENTIFIED: ${formMeta.form_name} (${formMeta.form_code})
${userQuery ? `CITIZEN'S SPECIFIC QUESTION: ${userQuery}` : ""}

VERIFIED KNOWLEDGE BASE CONTEXT:
${contextText}

Generate the complete guidance JSON for this form. If a citizen's specific question is shown above, you must answer it in the "custom_query_answer" field. Remember: simplest language possible.`;

    const guidanceResponse = await callNvidiaNIM(GEN_MODEL, [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt }
    ]);

    let guidance;
    try {
      const rawText = guidanceResponse.choices[0].message.content;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      guidance = JSON.parse(jsonMatch![0]);
    } catch (e) {
      console.error("Parse error of guidance text:", guidanceResponse, e);
      return errorResponse("Failed to parse guidance generation output.", 500);
    }

    // ── 8. Attach source citations from DB metadata ───────────────
    guidance.sources = finalChunks.map((c: any) => ({
      chunk_title: c.chunk_title,
      chunk_type:  c.chunk_type,
      similarity:  parseFloat(c.similarity.toFixed(3)),
      form_name:   formMeta.form_name,
      version:     formMeta.version,
      source_url:  formMeta.source_url,
      last_verified: formMeta.last_verified_at
    }));

    // ── 9. Final response ─────────────────────────────────────────
    return jsonResponse({
      status:          "success",
      form_code:       classification.formCode,
      form_name:       formMeta.form_name,
      confidence:      classification.confidence,
      isGovernmentRelated: classification.isGovernmentRelated ?? false,
      authenticity: classification.authenticity ?? "not_applicable",
      authenticityReason: classification.authenticityReason ?? "",
      visualAnalysis: classification.visualAnalysis ?? "",
      documentType: classification.documentType ?? "unknown",
      chunks_used:     finalChunks.length,
      guidance
    });

  } catch (err: any) {
    console.error("analyze-form error:", err);
    return errorResponse(`Internal server error: ${err.message || err}`, 500);
  }
});

// ── Helpers ──────────────────────────────────────────────────────

async function callNvidiaNIM(model: string, messages: any[]) {
  const nvidiaKey = Deno.env.get("NVIDIA_NIM_API_KEY");
  if (!nvidiaKey) {
    throw new Error("NVIDIA_NIM_API_KEY environment variable is missing.");
  }

  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${nvidiaKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048, temperature: 0.1 })
  });

  if (!res.ok) {
    throw new Error(`NVIDIA NIM error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ status: "error", message }, status);
}
