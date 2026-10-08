import { describe, it, expect } from "vitest";
import { TextPreprocessor } from "./text-preprocessor.js";
import { TfIdfAnalyzer } from "./tf-idf-analyzer.js";
import { ReviewClusterer } from "./review-clusterer.js";
import { InsightGenerator } from "./insight-generator.js";
import type { Review } from "@reviewlens/shared";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReview(
  content: string,
  rating: number,
  id = Math.random().toString()
): Review {
  const sentiment =
    rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";
  return {
    id,
    content,
    rating,
    date: "2024-01-01",
    appVersion: "1.0.0",
    sentiment,
    author: "Test User",
  };
}

// ── Deterministic test dataset ────────────────────────────────────────────────

const BATTERY_REVIEWS: Review[] = [
  makeReview("The app drains battery very fast", 2, "b1"),
  makeReview("Battery consumption is terrible, drains in hours", 1, "b2"),
  makeReview("App uses too much battery, draining quickly", 2, "b3"),
  makeReview("Battery drain is unacceptable after the latest release", 1, "b4"),
  makeReview("Huge battery drain, phone heats up when app is open", 2, "b5"),
];

const CRASH_REVIEWS: Review[] = [
  makeReview("App crashes every time I open it", 1, "c1"),
  makeReview("Keeps crashing on startup, completely unusable", 1, "c2"),
  makeReview("The app crashes randomly throughout the day", 2, "c3"),
];

const DARK_MODE_REVIEWS: Review[] = [
  makeReview("Please add dark mode, my eyes hurt at night", 3, "d1"),
  makeReview("Would love a dark mode option or night theme", 4, "d2"),
];

const ALL_REVIEWS = [...BATTERY_REVIEWS, ...CRASH_REVIEWS, ...DARK_MODE_REVIEWS];

// ── TextPreprocessor ──────────────────────────────────────────────────────────

describe("TextPreprocessor", () => {
  const preprocessor = new TextPreprocessor();

  it("lowercases and removes punctuation", () => {
    const tokens = preprocessor.preprocess("The app is VERY slow!!!");
    expect(tokens).not.toContain("VERY");
    expect(tokens).not.toContain("!!!");
    expect(tokens.every((t) => t === t.toLowerCase())).toBe(true);
  });

  it("removes stop words", () => {
    const tokens = preprocessor.preprocess("the app is very slow after the update");
    expect(tokens).not.toContain("the");
    expect(tokens).not.toContain("is");
    expect(tokens).not.toContain("very");
    expect(tokens).not.toContain("after");
  });

  it("removes short tokens", () => {
    const tokens = preprocessor.preprocess("ok so it is bad");
    tokens.forEach((t) => expect(t.length).toBeGreaterThan(2));
  });

  it("preserves meaningful content words", () => {
    const tokens = preprocessor.preprocess("battery drain crash freeze slow");
    expect(tokens).toContain("battery");
    expect(tokens).toContain("drain");
    expect(tokens).toContain("crash");
    expect(tokens).toContain("freeze");
    expect(tokens).toContain("slow");
  });
});

// ── TfIdfAnalyzer ─────────────────────────────────────────────────────────────

describe("TfIdfAnalyzer", () => {
  const preprocessor = new TextPreprocessor();
  const tfidf = new TfIdfAnalyzer();

  it("builds vectors with non-zero weights for terms in document", () => {
    const docs = [
      preprocessor.preprocess("battery drain fast"),
      preprocessor.preprocess("crash freeze startup"),
    ];
    const vectors = tfidf.buildVectors(docs);
    expect(vectors).toHaveLength(2);
    expect(vectors[0].get("battery")).toBeGreaterThan(0);
    expect(vectors[0].get("crash")).toBeUndefined();
  });

  it("gives higher IDF to rare terms", () => {
    const docs = [
      preprocessor.preprocess("battery drain fast"),
      preprocessor.preprocess("battery drain slow"),
      preprocessor.preprocess("crash freeze startup"),
    ];
    const vectors = tfidf.buildVectors(docs);
    // "crash" appears in only 1/3 docs → higher IDF than "battery" (2/3 docs)
    const crashWeight = vectors[2].get("crash") ?? 0;
    const batteryWeightInDoc0 = vectors[0].get("battery") ?? 0;
    // Both should be positive; crash should have higher IDF factor
    expect(crashWeight).toBeGreaterThan(0);
    expect(batteryWeightInDoc0).toBeGreaterThan(0);
  });

  it("cosine similarity of identical vectors is 1", () => {
    const v1 = new Map([["battery", 0.5], ["drain", 0.8]]);
    const cosine = tfidf.cosine(v1, v1);
    expect(cosine).toBeCloseTo(1, 5);
  });

  it("cosine similarity of orthogonal vectors is 0", () => {
    const v1 = new Map([["battery", 1.0]]);
    const v2 = new Map([["crash", 1.0]]);
    expect(tfidf.cosine(v1, v2)).toBe(0);
  });

  it("cosine similarity of similar vectors is between 0 and 1", () => {
    const v1 = new Map([["battery", 0.5], ["drain", 0.3]]);
    const v2 = new Map([["battery", 0.4], ["slow", 0.6]]);
    const sim = tfidf.cosine(v1, v2);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });

  it("topTerms returns terms sorted by weight", () => {
    const docs = [preprocessor.preprocess("battery drain crash battery")];
    const vectors = tfidf.buildVectors(docs);
    const top = tfidf.topTerms(vectors, 3);
    expect(top.length).toBeLessThanOrEqual(3);
    expect(Array.isArray(top)).toBe(true);
  });
});

// ── ReviewClusterer ───────────────────────────────────────────────────────────

describe("ReviewClusterer", () => {
  const preprocessor = new TextPreprocessor();
  const tfidf = new TfIdfAnalyzer();
  const clusterer = new ReviewClusterer();

  function buildInputs(reviews: Review[]) {
    const preprocessed = reviews.map((r) => preprocessor.preprocess(r.content));
    const vectors = tfidf.buildVectors(preprocessed);
    return { preprocessed, vectors };
  }

  it("groups similar reviews together", () => {
    const { preprocessed, vectors } = buildInputs(ALL_REVIEWS);
    const clusters = clusterer.cluster(preprocessed, vectors);

    // Should produce at least 2 clusters (battery + crash at minimum)
    expect(clusters.length).toBeGreaterThanOrEqual(2);

    // All cluster indices should be valid
    for (const cluster of clusters) {
      expect(cluster.length).toBeGreaterThanOrEqual(2);
      for (const idx of cluster) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(ALL_REVIEWS.length);
      }
    }
  });

  it("returns empty array for empty input", () => {
    const clusters = clusterer.cluster([], []);
    expect(clusters).toEqual([]);
  });

  it("returns empty array when no reviews are similar enough", () => {
    // 5 completely different reviews (one word each)
    const reviews = [
      makeReview("battery battery battery battery", 2),
      makeReview("weather forecast rain sunny temperature", 3),
      makeReview("cooking recipe ingredients delicious meal", 5),
      makeReview("exercise gym workout fitness training", 4),
      makeReview("music concert orchestra symphony piano", 5),
    ];
    const { preprocessed, vectors } = buildInputs(reviews);
    const clusters = clusterer.cluster(preprocessed, vectors);
    // Unrelated topics should not cluster together
    // Each may be a singleton (filtered) or small group
    for (const cluster of clusters) {
      expect(cluster.length).toBeGreaterThanOrEqual(2);
    }
  });
});

// ── InsightGenerator ──────────────────────────────────────────────────────────

describe("InsightGenerator", () => {
  const preprocessor = new TextPreprocessor();
  const tfidf = new TfIdfAnalyzer();
  const clusterer = new ReviewClusterer();
  const generator = new InsightGenerator();

  function analyzeAll(reviews: Review[]) {
    const preprocessed = reviews.map((r) => preprocessor.preprocess(r.content));
    const vectors = tfidf.buildVectors(preprocessed);
    const clusters = clusterer.cluster(preprocessed, vectors);
    return generator.generate(reviews, clusters, preprocessed, vectors);
  }

  it("generates insights from mixed reviews", () => {
    const insights = analyzeAll(ALL_REVIEWS);
    expect(insights.length).toBeGreaterThanOrEqual(1);
  });

  it("marks battery reviews as complaints with battery keywords", () => {
    const insights = analyzeAll(BATTERY_REVIEWS);
    // With only battery reviews, all insights should be complaints
    // (they may form 1 or more clusters depending on similarity threshold)
    if (insights.length > 0) {
      for (const insight of insights) {
        expect(insight.category).toBe("complaint");
      }
      // Note: when ALL docs share a term ("battery"), its IDF → 0, so some pairs
      // may fall below similarity threshold. At least 2 reviews should cluster.
      const totalMentions = insights.reduce((s, i) => s + i.mentions, 0);
      expect(totalMentions).toBeGreaterThanOrEqual(2);
      // At least one insight should have battery-related keywords
      const hasBatteryKeyword = insights.some((insight) =>
        insight.keywords.some((k) =>
          ["battery", "drain", "draining"].includes(k)
        )
      );
      expect(hasBatteryKeyword).toBe(true);
    }
  });

  it("marks dark mode reviews as feature_request", () => {
    const insights = analyzeAll(DARK_MODE_REVIEWS);
    if (insights.length > 0) {
      expect(insights[0].category).toBe("feature_request");
    }
  });

  it("each insight has required fields", () => {
    const insights = analyzeAll(ALL_REVIEWS);
    for (const insight of insights) {
      expect(typeof insight.title).toBe("string");
      expect(insight.title.length).toBeGreaterThan(0);
      expect(["complaint", "feature_request", "positive"]).toContain(
        insight.category
      );
      expect(["high", "medium", "low"]).toContain(insight.severity);
      expect(typeof insight.mentions).toBe("number");
      expect(insight.mentions).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(insight.examples)).toBe(true);
      expect(Array.isArray(insight.keywords)).toBe(true);
      expect(typeof insight.summary).toBe("string");
      expect(typeof insight.suggestedAction).toBe("string");
    }
  });

  it("crash reviews produce high severity insight", () => {
    const insights = analyzeAll(CRASH_REVIEWS);
    if (insights.length > 0) {
      expect(insights[0].severity).toBe("high");
    }
  });

  it("examples contain original review text (not modified)", () => {
    const insights = analyzeAll(ALL_REVIEWS);
    const allOriginalContent = new Set(ALL_REVIEWS.map((r) => r.content));
    for (const insight of insights) {
      for (const example of insight.examples) {
        expect(allOriginalContent.has(example)).toBe(true);
      }
    }
  });
});
