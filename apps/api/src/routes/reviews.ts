import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import type { FetchReviewsResponse, ApiErrorResponse } from "@reviewlens/shared";
import { parsePackageName } from "../utils/parsePackageName.js";
import {
  fetchReviews,
  AppNotFoundError,
  FetchTimeoutError,
} from "../services/reviewService.js";

interface FetchBody {
  packageName: string;
}

const reviewRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/api/reviews/google-play",
    {
      schema: {
        body: {
          type: "object",
          required: ["packageName"],
          properties: {
            packageName: { type: "string", minLength: 1, maxLength: 256 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: FetchBody }>,
      reply: FastifyReply
    ): Promise<FetchReviewsResponse | ApiErrorResponse> => {
      const { packageName: rawInput } = request.body;

      const packageName = parsePackageName(rawInput);
      if (!packageName) {
        return reply.status(400).send({
          error:
            "Invalid package name. Provide a valid package name (e.g. com.example.app) or a Google Play Store URL.",
          code: "INVALID_PACKAGE",
        } satisfies ApiErrorResponse);
      }

      try {
        const reviews = await fetchReviews(packageName);

        if (reviews.length === 0) {
          return reply.status(200).send({
            packageName,
            total: 0,
            reviews: [],
          } satisfies FetchReviewsResponse);
        }

        return reply.status(200).send({
          packageName,
          total: reviews.length,
          reviews,
        } satisfies FetchReviewsResponse);
      } catch (err) {
        if (err instanceof AppNotFoundError) {
          return reply.status(404).send({
            error: `App "${packageName}" was not found on Google Play.`,
            code: "APP_NOT_FOUND",
          } satisfies ApiErrorResponse);
        }

        if (err instanceof FetchTimeoutError) {
          return reply.status(504).send({
            error: "The request to Google Play timed out. Please try again.",
            code: "TIMEOUT",
          } satisfies ApiErrorResponse);
        }

        fastify.log.error(err);
        return reply.status(502).send({
          error: "Failed to fetch reviews from Google Play. Please try again.",
          code: "FETCH_ERROR",
        } satisfies ApiErrorResponse);
      }
    }
  );
};

export default reviewRoutes;
