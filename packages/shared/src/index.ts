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
  | "TIMEOUT";

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
}
