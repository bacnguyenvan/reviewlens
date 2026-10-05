import OpenAI from "openai";
import type { Review, ReviewInsight } from "@reviewlens/shared";

// ── Constants ────────────────────────────────────────────────────────────────

const ANALYZE_LIMIT = 100;
const AI_TIMEOUT_MS = 60_000;
const MODEL = "gpt-4o-mini";

// ── Errors ───────────────────────────────────────────────────────────────────

export class AIConfigError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured. Set it in your .env file.");
    this.name = "AIConfigError";
  }
}

export class AITimeoutError extends Error {
  constructor() {
    super("AI analysis timed out. Try again with fewer reviews.");
    this.name = "AITimeoutError";
  }
}

export class AIResponseError extends Error {
  constructor(reason: string) {
    super(`AI returned an unexpected response: ${reason}`);
    this.name = "AIResponseError";
  }
}

// ── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior product analyst specializing in mobile app reviews.

Your task: Analyze a batch of Google Play user reviews and identify recurring themes.

Rules:
- Group semantically similar reviews into insight groups. Do NOT summarize individual reviews — find patterns across multiple reviews.
- Identify complaints, feature requests, and positive feedback.
- Severity (high/medium/low) is based on frequency and user impact:
    high   = affects many users or blocks core functionality
    medium = noticeable issue or frequently requested feature
    low    = minor annoyance or occasional positive praise
- "mentions" = the number of reviews that contribute to this insight.
- Provide 1–3 representative verbatim review snippets as "examples".
- "suggestedAction" = a specific, actionable recommendation for the dev team.
- Only report patterns supported by actual review content. Return fewer insights if evidence is thin.
- Return ONLY valid JSON — no markdown fences, no prose, no explanation.

JSON schema:
{
  "insights": [
    {
      "title": "Concise, specific theme title",
      "category": "complaint" | "feature_request" | "positive",
      "severity": "high" | "medium" | "low",
      "mentions": <integer>,
      "summary": "2–3 sentences describing the pattern and its impact.",
      "examples": ["verbatim quote 1", "verbatim quote 2"],
      "suggestedAction": "Specific action the development team should take."
    }
  ]
}`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildClient(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) throw new AIConfigError();
  return new OpenAI({ apiKey });
}

function formatReviews(reviews: Review[]): string {
  return reviews
    .slice(0, ANALYZE_LIMIT)
    .map((r, i) => `[${i + 1}] Rating: ${r.rating}/5\n"${r.content.trim()}"`)
    .join("\n\n");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("__TIMEOUT__")), ms)
    ),
  ]);
}

function isValidInsight(obj: unknown): obj is ReviewInsight {
  if (typeof obj !== "object" || obj === null) return false;
  const i = obj as Record<string, unknown>;
  return (
    typeof i["title"] === "string" &&
    i["title"].length > 0 &&
    (["complaint", "feature_request", "positive"] as unknown[]).includes(
      i["category"]
    ) &&
    (["high", "medium", "low"] as unknown[]).includes(i["severity"]) &&
    typeof i["mentions"] === "number" &&
    i["mentions"] >= 0 &&
    typeof i["summary"] === "string" &&
    i["summary"].length > 0 &&
    Array.isArray(i["examples"]) &&
    (i["examples"] as unknown[]).every((e) => typeof e === "string") &&
    typeof i["suggestedAction"] === "string" &&
    i["suggestedAction"].length > 0
  );
}

function parseResponse(raw: string): ReviewInsight[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AIResponseError("invalid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new AIResponseError("expected a JSON object");
  }

  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj["insights"])) {
    throw new AIResponseError('missing "insights" array');
  }

  const valid = (obj["insights"] as unknown[]).filter(isValidInsight);

  if (valid.length === 0) {
    throw new AIResponseError("no valid insights in response");
  }

  return valid;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function analyzeReviews(reviews: Review[]): Promise<ReviewInsight[]> {
  const client = buildClient(); // throws AIConfigError if key missing

  const prompt = `Analyze these ${Math.min(reviews.length, ANALYZE_LIMIT)} app reviews:\n\n${formatReviews(reviews)}`;

  let completion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    completion = await withTimeout(
      client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      AI_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof Error && err.message === "__TIMEOUT__") {
      throw new AITimeoutError();
    }
    // Map OpenAI SDK errors to our own types so the route handler can give
    // the caller a useful message instead of a generic 500.
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) {
        throw new AIConfigError(); // bad or revoked key
      }
      if (err.status === 429) {
        // Could be rate-limit OR no credits — surface the real reason
        const msg =
          err.message.toLowerCase().includes("credit") ||
          err.message.toLowerCase().includes("quota")
            ? "Your OpenAI account has no credits. Add credits at platform.openai.com/settings/organization/billing."
            : "OpenAI rate limit reached. Please wait a moment and try again.";
        throw new AIResponseError(msg);
      }
      // Any other 4xx/5xx from OpenAI
      throw new AIResponseError(`OpenAI API error (${err.status}): ${err.message}`);
    }
    throw err;
  }

  const content = completion.choices[0]?.message.content ?? "";
  if (!content) throw new AIResponseError("empty response");

  return parseResponse(content);
}
