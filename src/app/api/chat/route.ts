import Groq from "groq-sdk";
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "groq-sdk/resources/chat/completions";
import { SYSTEM_PROMPT } from "@/lib/assistant/prompt";
import { whatsappLink } from "@/content/site";

/**
 * Abu Omar chat endpoint (Groq). Streams newline-delimited JSON events to the browser:
 *   {"t":"text","v":"..."}            assistant text as it is generated
 *   {"t":"handoff","url":"...","name":"..."}  WhatsApp button for the visitor
 *   {"t":"error","code":"..."}        unavailable | limited | invalid | failed
 *   {"t":"done"}
 */
export const runtime = "nodejs";

const MODEL = "openai/gpt-oss-120b";
const MAX_TURNS = 24; // conversation messages accepted from the browser
const MAX_CHARS = 1500; // per message
const MAX_TOOL_ROUNDS = 3;

// Simple per-IP limit (per server instance) to keep usage predictable.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 25;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

type ChatTurn = { role: "user" | "assistant"; content: string };

function parseBody(body: unknown): ChatTurn[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS) return null;
  const turns: ChatTurn[] = [];
  for (const m of messages) {
    const role = (m as ChatTurn)?.role;
    const content = (m as ChatTurn)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (!text) return null;
    turns.push({ role, content: text });
  }
  if (turns[0].role !== "user" || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

const HANDOFF = "prepare_whatsapp_handoff";
const handoffTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: HANDOFF,
    description:
      "Show the visitor a WhatsApp button that opens a chat with the Shifra Code team, with a pre-written message summarising their request. Call it only once you know the visitor's name and what they want to build. Write the fields in the visitor's language.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The visitor's name." },
        project: {
          type: "string",
          description: "One or two sentences describing what they want to build and for what business.",
        },
        contact: {
          type: "string",
          description: "Optional phone number or business name the visitor shared. Empty string if none.",
        },
      },
      required: ["name", "project"],
    },
  },
};

/** Parse and validate the model's tool arguments before acting on them. */
function readHandoff(args: string) {
  let i: Record<string, unknown>;
  try {
    i = JSON.parse(args || "{}");
  } catch {
    return null;
  }
  if (typeof i.name !== "string" || typeof i.project !== "string") return null;
  const name = i.name.trim().slice(0, 80);
  const project = i.project.trim().slice(0, 600);
  const contact = typeof i.contact === "string" ? i.contact.trim().slice(0, 80) : "";
  if (!name || !project) return null;
  return { name, project, contact };
}

function handoffMessage(h: { name: string; project: string; contact: string }, arabic: boolean) {
  return arabic
    ? `مرحباً شيفرا كود 👋\nأنا ${h.name}.\n${h.project}${h.contact ? `\nللتواصل: ${h.contact}` : ""}\n(من مساعد أبو عمر على الموقع)`
    : `Hi Shifra Code 👋\nI'm ${h.name}.\n${h.project}${h.contact ? `\nContact: ${h.contact}` : ""}\n(via Abu Omar on the website)`;
}

export async function POST(request: Request) {
  const turns = parseBody(await request.json().catch(() => null));
  const encoder = new TextEncoder();
  const reply = (events: object[], status = 200) =>
    new Response(events.map((e) => JSON.stringify(e)).join("\n") + "\n", {
      status,
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
    });

  if (!turns) return reply([{ t: "error", code: "invalid" }, { t: "done" }], 400);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return reply([{ t: "error", code: "limited" }, { t: "done" }], 429);

  // The key lives only on the server (GROQ_API_KEY in .env.local or the host's env).
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return reply([{ t: "error", code: "unavailable" }, { t: "done" }], 503);
  const client = new Groq({ apiKey, baseURL: "https://api.groq.com" });

  const arabic = /[؀-ۿ]/.test(turns[turns.length - 1].content);

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...turns.map((t) => ({ role: t.role, content: t.content })),
      ];

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const stream = await client.chat.completions.create({
            model: MODEL,
            messages,
            tools: [handoffTool],
            tool_choice: "auto",
            stream: true,
            temperature: 0.6,
            max_completion_tokens: 2048,
            reasoning_effort: "low",
            include_reasoning: false, // never stream the model's reasoning to visitors
          });

          let text = "";
          let finish: string | null = null;
          const calls: ChatCompletionMessageToolCall[] = [];
          for await (const chunk of stream) {
            const choice = chunk.choices[0];
            if (!choice) continue;
            if (choice.delta.content) {
              text += choice.delta.content;
              send({ t: "text", v: choice.delta.content });
            }
            // Tool calls arrive in fragments keyed by index; stitch them together.
            for (const part of choice.delta.tool_calls ?? []) {
              const call = (calls[part.index] ??= { id: "", type: "function", function: { name: "", arguments: "" } });
              if (part.id) call.id = part.id;
              if (part.function?.name) call.function.name += part.function.name;
              if (part.function?.arguments) call.function.arguments += part.function.arguments;
            }
            if (choice.finish_reason) finish = choice.finish_reason;
          }

          // Only act on complete tool calls (not ones cut off by the length limit).
          if (finish !== "tool_calls" || calls.length === 0) break;

          messages.push({ role: "assistant", content: text || null, tool_calls: calls });
          for (const call of calls) {
            const handoff = call.function.name === HANDOFF ? readHandoff(call.function.arguments) : null;
            if (handoff) send({ t: "handoff", url: whatsappLink(handoffMessage(handoff, arabic)), name: handoff.name });
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: handoff
                ? "The WhatsApp button is now shown to the visitor."
                : "INVALID_INPUT: name and project are required.",
            });
          }
        }
      } catch (error) {
        const code =
          error instanceof Groq.AuthenticationError || error instanceof Groq.PermissionDeniedError
            ? "unavailable"
            : error instanceof Groq.RateLimitError
              ? "limited"
              : "failed";
        if (code === "failed") console.error("[chat]", error);
        send({ t: "error", code });
      }
      send({ t: "done" });
      controller.close();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
