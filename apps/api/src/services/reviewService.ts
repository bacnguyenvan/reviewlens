import gplay from "google-play-scraper";
import type { IReviewsItem } from "google-play-scraper";

// google-play-scraper typings declare `sort` as an enum value, not the namespace.
// At runtime gplay.sort IS the enum object, so we access the numeric value directly.
const SORT_NEWEST = 2; // gplay.sort.NEWEST
import type { Review, Sentiment } from "@reviewlens/shared";

const FETCH_LIMIT = 100;
const TIMEOUT_MS = 15_000;

function deriveSentiment(score: number): Sentiment {
  if (score >= 4) return "positive";
  if (score <= 2) return "negative";
  return "neutral";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

export class AppNotFoundError extends Error {
  constructor(packageName: string) {
    super(`App not found: ${packageName}`);
    this.name = "AppNotFoundError";
  }
}

export class FetchTimeoutError extends Error {
  constructor() {
    super("Review fetch timed out");
    this.name = "FetchTimeoutError";
  }
}

export async function fetchReviews(packageName: string): Promise<Review[]> {
  let result: { data: IReviewsItem[] };

  try {
    result = await withTimeout(
      gplay.reviews({
        appId: packageName,
        lang: "en",
        country: "us",
        sort: SORT_NEWEST,
        num: FETCH_LIMIT,
      }),
      TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "TIMEOUT") throw new FetchTimeoutError();
      // google-play-scraper throws various messages for unknown apps
      const msg = err.message.toLowerCase();
      if (
        msg.includes("not found") ||
        msg.includes("error retrieving") ||
        msg.includes("app <")
      ) {
        throw new AppNotFoundError(packageName);
      }
    }
    throw err;
  }

  return result.data.map((item) => ({
    id: item.id,
    rating: item.score,
    content: item.text || item.title || "",
    date: item.date,
    appVersion: item.version ?? "unknown",
    sentiment: deriveSentiment(item.score),
    author: item.userName,
  }));
}
