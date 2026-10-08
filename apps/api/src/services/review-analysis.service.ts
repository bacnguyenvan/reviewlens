import type { Review, ReviewInsight } from "@reviewlens/shared";
import { TextPreprocessor } from "../analysis/text-preprocessor.js";
import { TfIdfAnalyzer } from "../analysis/tf-idf-analyzer.js";
import { ReviewClusterer } from "../analysis/review-clusterer.js";
import { InsightGenerator } from "../analysis/insight-generator.js";

// ── Public interface (allows future AI providers to be swapped in) ─────────────

export interface ReviewAnalyzer {
  analyzeReviews(reviews: Review[]): Promise<ReviewInsight[]>;
}

// ── Errors ───────────────────────────────────────────────────────────────────

export class AnalysisError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "AnalysisError";
  }
}

// ── Local (free, offline) implementation ─────────────────────────────────────

/**
 * Analyses reviews locally using TF-IDF + cosine similarity clustering.
 * No external API, no API key, no cost.
 *
 * Primary pipeline:
 *   Review[] → TextPreprocessor → TfIdfAnalyzer → ReviewClusterer → InsightGenerator
 *
 * Fallback (triggered when TF-IDF clustering produces < 2 clusters, e.g. very few
 * or very diverse reviews, or non-English content that preprocesses to zero tokens):
 *   Reviews are grouped by star-rating bucket (1–2 = complaint, 3 = neutral, 4–5 = positive)
 *   so the user always receives actionable output.
 */
export class LocalReviewAnalyzer implements ReviewAnalyzer {
  private readonly preprocessor = new TextPreprocessor();
  private readonly tfidf = new TfIdfAnalyzer();
  private readonly clusterer = new ReviewClusterer();
  private readonly generator = new InsightGenerator();

  async analyzeReviews(reviews: Review[]): Promise<ReviewInsight[]> {
    if (reviews.length === 0) {
      throw new AnalysisError("No reviews provided for analysis.");
    }

    // ── Step 1: Preprocess & vectorise ──────────────────────────────────────
    const preprocessed = reviews.map((r) =>
      this.preprocessor.preprocess(r.content)
    );
    const vectors = this.tfidf.buildVectors(preprocessed);

    // ── Step 2: TF-IDF clustering ────────────────────────────────────────────
    let clusters = this.clusterer.cluster(preprocessed, vectors);

    // ── Step 3: Rating-bucket fallback ───────────────────────────────────────
    //
    // TF-IDF clustering can fail when:
    //   • The dataset is small (< ~15 reviews) — not enough diversity for IDF to spread
    //   • Reviews are in non-English languages — the ASCII preprocessor strips them
    //   • Reviews are all unique / too short — no shared terms above threshold
    //
    // In these cases we fall back to grouping by star rating so the user always
    // gets some signal, even if it is coarser.
    if (clusters.length < 2) {
      const clusteredSet = new Set(clusters.flat());
      // Identify every review not already in a TF-IDF cluster
      const uncovered = reviews
        .map((_, i) => i)
        .filter((i) => !clusteredSet.has(i));

      const buckets = buildRatingBuckets(uncovered, reviews);
      clusters = [...clusters, ...buckets];
    }

    if (clusters.length === 0) return [];

    // ── Step 4: Generate insights ────────────────────────────────────────────
    const insights = this.generator.generate(
      reviews,
      clusters,
      preprocessed,
      vectors
    );

    // Sort: high severity first, then by number of mentions (desc)
    const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => {
      const sev =
        (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
      return sev !== 0 ? sev : b.mentions - a.mentions;
    });

    return insights;
  }
}

// ── Rating bucket helpers ─────────────────────────────────────────────────────

/**
 * Groups review indices into up to three buckets by star rating.
 * Returns only non-empty buckets (each with ≥ 1 review).
 */
function buildRatingBuckets(indices: number[], reviews: Review[]): number[][] {
  const negative = indices.filter((i) => reviews[i].rating <= 2);
  const neutral = indices.filter((i) => reviews[i].rating === 3);
  const positive = indices.filter((i) => reviews[i].rating >= 4);

  const buckets: number[][] = [];
  if (negative.length >= 1) buckets.push(negative);
  if (positive.length >= 1) buckets.push(positive);
  // Only include neutral bucket if it has 2+ reviews (avoids a "meh" singleton insight)
  if (neutral.length >= 2) buckets.push(neutral);

  return buckets;
}

// ── Convenience export (used by the route handler) ────────────────────────────

const analyzer: ReviewAnalyzer = new LocalReviewAnalyzer();

export function analyzeReviews(reviews: Review[]): Promise<ReviewInsight[]> {
  return analyzer.analyzeReviews(reviews);
}
