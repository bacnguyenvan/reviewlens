import type {
  FetchReviewsResponse,
  ApiErrorResponse,
  Review,
  AnalyzeReviewsResponse,
} from "@reviewlens/shared";

export class ApiError extends Error {
  readonly code: ApiErrorResponse["code"];
  readonly status: number;

  constructor(message: string, code: ApiErrorResponse["code"], status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  body: unknown
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok) {
    const err = data as ApiErrorResponse;
    throw new ApiError(err.error, err.code, response.status);
  }

  return data as T;
}

export function fetchGooglePlayReviews(
  packageName: string
): Promise<FetchReviewsResponse> {
  return request<FetchReviewsResponse>("/api/reviews/google-play", {
    packageName,
  });
}

export function analyzeReviews(
  reviews: Review[]
): Promise<AnalyzeReviewsResponse> {
  return request<AnalyzeReviewsResponse>("/api/reviews/analyze", { reviews });
}
