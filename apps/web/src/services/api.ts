import type {
  FetchReviewsResponse,
  ApiErrorResponse,
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

export async function fetchGooglePlayReviews(
  packageName: string
): Promise<FetchReviewsResponse> {
  const response = await fetch("/api/reviews/google-play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageName }),
  });

  const data = (await response.json()) as FetchReviewsResponse | ApiErrorResponse;

  if (!response.ok) {
    const err = data as ApiErrorResponse;
    throw new ApiError(err.error, err.code, response.status);
  }

  return data as FetchReviewsResponse;
}
