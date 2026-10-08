export type HealthResponse = {
  status: "ok";
};

export type Sentiment = "positive" | "negative" | "neutral";

export interface Review {
  id: string;
  rating: number;
  content: string;
  date: string;
  appVersion: string;
  sentiment: Sentiment;
  author: string;
}

export interface FetchReviewsResponse {
  packageName: string;
  total: number;
  reviews: Review[];
}

export type ApiErrorCode =
  | "INVALID_PACKAGE"
  | "APP_NOT_FOUND"
  | "NO_REVIEWS"
  | "FETCH_ERROR"
  | "TIMEOUT"
  | "AI_NOT_CONFIGURED"
  | "AI_ERROR"
  | "AI_TIMEOUT"
  | "INVALID_INPUT";

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
}

// ── AI Analysis types ────────────────────────────────────────────────────────

export type ReviewInsightCategory = "complaint" | "feature_request" | "positive";

export type ReviewInsightSeverity = "high" | "medium" | "low";

export interface ReviewInsight {
  title: string;
  category: ReviewInsightCategory;
  severity: ReviewInsightSeverity;
  mentions: number;
  summary: string;
  examples: string[];
  keywords: string[];
  suggestedAction: string;
}

export interface AnalyzeReviewsResponse {
  insights: ReviewInsight[];
}
