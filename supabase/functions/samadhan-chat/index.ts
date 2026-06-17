import { verifyUser } from "../shared/edge/auth/jwt.ts";
import { getCorsAndSecurityHeaders } from "../shared/edge/middleware/cors.ts";
import { checkRateLimit } from "../shared/edge/middleware/rateLimit.ts";
import { logSecurityEvent } from "../shared/edge/services/securityLogger.ts";
import { scanForPromptInjection, sanitizeInput } from "../shared/edge/ai/guardrails.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const EMBED_MODEL  = "nvidia/llama-nemotron-embed-1b-v2";

const SYSTEM_PROMPT = `You are Samadhan AI, a strict RAG-based civic governance assistant for Indian citizens. Your primary purpose is to help citizens with queries regarding official Indian government forms, welfare schemes, and civic documents in our database.

Strict Grounding and Out-of-Context Policies:
1. **Strict Context Constraints**: You are provided with verified context chunks containing government information. You must ONLY answer the user's query if it can be directly and accurately answered from the provided context.
2. **Refusing Off-Topic / General Queries**: If the provided context is empty, or if the user's query is out-of-context (e.g. general chat, jokes, coding, maths, general science, international queries, general life advice, cooking recipes, or off-topic questions), you MUST politely refuse to answer. You should reply with exactly this response:
   - In English: "I am sorry, but I can only answer queries related to the official Indian government forms, schemes, and documents in my knowledge base. Please ask a relevant query."
   - In Hindi: "मुझे क्षमा करें, मैं केवल मेरे ज्ञानकोश में उपलब्ध आधिकारिक भारतीय सरकारी फॉर्मों, योजनाओं और दस्तावेजों से संबंधित प्रश्नों के उत्तर दे सकता हूँ। कृपया कोई प्रासंगिक प्रश्न पूछें।"
3. **No Hallucination**: Do not invent facts, URLs, contacts, or criteria. If the retrieved context is insufficient to answer the query, say that you cannot find the verified details in the knowledge base.
4. **General Conversation**: You may respond politely to standard greetings (like "hello", "hi", "namaste"), but always redirect the user back to asking about civic schemes and forms.

Start responses directly and concisely without unnecessary introductions.`;

// Zod schemas for validation
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content is required").max(4000, "Message content too long"),
});

const chatPayloadSchema = z.object({
  messages: z.array(messageSchema).min(1, "Messages array must not be empty"),
});

Deno.serve(async (req) => {
  const headers = getCorsAndSecurityHeaders(req);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  let userId: string | null = null;

  try {
    // 1. JWT Authentication Verification
    const authResult = await verifyUser(req);
    if (authResult.error) {
      await logSecurityEvent("auth_failure", { error: authResult.error }, null, clientIp);
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
      });
    }
    userId = authResult.user.id;

    // 2. Rate Limiting Check: AI Chat limit is 30 requests per minute (60s)
    const rateCheck = await checkRateLimit({
      userId,
      clientIp,
      endpoint: "chat",
      maxRequests: 30,
      windowSeconds: 60,
    });

    if (!rateCheck.allowed) {
      await logSecurityEvent("rate_limit", { endpoint: "chat", limit: 30 }, userId, clientIp);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        {
          status: 429,
          headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
        }
      );
    }

    // 3. Payload Validation
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
      });
    }

    const validated = chatPayloadSchema.safeParse(requestBody);
    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validated.error.flatten() }),
        {
          status: 400,
          headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = validated.data;

    // 4. Prompt Injection Scans & Sanitization
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      const injectionCheck = scanForPromptInjection(lastUserMessage.content);
      if (!injectionCheck.passed) {
        await logSecurityEvent(
          "injection_attempt",
          { detail: injectionCheck.reason, blockedContent: lastUserMessage.content },
          userId,
          clientIp
        );
        return new Response(
          JSON.stringify({ error: "Safety policy violation. Request rejected." }),
          {
            status: 403,
            headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
          }
        );
      }

      // Sanitize the message content to prevent XSS / markup script tags
      lastUserMessage.content = sanitizeInput(lastUserMessage.content);
    }

    // 5. Retrieve Google Gemini API Key from Env
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is missing");
      return new Response(JSON.stringify({ error: "Internal configuration error" }), {
        status: 500,
        headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
      });
    }

    // 6. RAG Retrieval via Vector Search (NVIDIA Embeddings + PostgreSQL match_global_chunks)
    let contextText = "";
    if (lastUserMessage) {
      const nvidiaKey = Deno.env.get("NVIDIA_NIM_API_KEY");
      if (nvidiaKey) {
        try {
          const embedResponse = await fetch(`${NVIDIA_BASE}/embeddings`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvidiaKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: EMBED_MODEL,
              input: [lastUserMessage.content],
              input_type: "query",
              truncate: "END"
            })
          });

          if (embedResponse.ok) {
            const embedData = await embedResponse.json();
            const queryEmbedding = embedData.data[0].embedding.slice(0, 1024);

            const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
            const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
              auth: { persistSession: false }
            });

            const { data: chunks, error: chunkError } = await supabase
              .rpc("match_global_chunks", {
                query_embedding: queryEmbedding,
                match_threshold: 0.30,
                match_count: 5
              });

            if (!chunkError && chunks && chunks.length > 0) {
              contextText = chunks
                .map((c: any) => `Source Form/Scheme: ${c.chunk_title}\nContent:\n${c.chunk_content}`)
                .join("\n\n---\n\n");
            }
          } else {
            console.error("Embedding request failed:", embedResponse.status, await embedResponse.text());
          }
        } catch (err) {
          console.error("RAG retrieval failed inside chat function:", err);
        }
      }
    }

    // Map messages to Gemini structure (role 'assistant' maps to 'model')
    const geminiMessages = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    // Direct fetch to Gemini API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: `${SYSTEM_PROMPT}\n\nVERIFIED CONTEXT CHUNKS:\n${contextText || "NO CONTEXT CHUNKS FOUND."}` }],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      await logSecurityEvent("api_error", { service: "gemini_ai", status: response.status }, userId, clientIp);
      
      const isRateLimit = response.status === 429;
      return new Response(
        JSON.stringify({
          error: isRateLimit
            ? "Rate limits exceeded. Please try again in a moment."
            : "Unable to process your request. Please try again.",
        }),
        {
          status: isRateLimit ? 429 : 500,
          headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
        }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Gemini stream reader is unavailable");
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // SSE Stream translation for frontend compatibility
    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, newlineIndex).trim();
              buffer = buffer.slice(newlineIndex + 1);

              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6);
                try {
                  const parsed = JSON.parse(jsonStr);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const sseChunk = `data: ${JSON.stringify({
                      choices: [{ delta: { content: text } }],
                    })}\n\n`;
                    controller.enqueue(encoder.encode(sseChunk));
                  }
                } catch {
                  // Ignore parsing errors on incomplete chunks
                }
              }
            }
          }

          // Send the final DONE event to notify frontend client to close stream
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          console.error("Streaming error inside ReadableStream:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    await logSecurityEvent("server_error", { error: e instanceof Error ? e.message : "Unknown" }, userId, clientIp);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...Object.fromEntries(headers.entries()), "Content-Type": "application/json" },
      }
    );
  }
});
