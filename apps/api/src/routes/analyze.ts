import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import type {
  Review,
  AnalyzeReviewsResponse,
  ApiErrorResponse,
} from "@reviewlens/shared";
import {
  analyzeReviews,
  AIConfigError,
  AITimeoutError,
  AIResponseError,
} from "../services/ai.service.js";

const MAX_REVIEWS = 100;

interface AnalyzeBody {
  reviews: Review[];
}

const analyzeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/api/reviews/analyze",
    {
      schema: {
        body: {
          type: "object",
          required: ["reviews"],
          properties: {
            reviews: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["rating", "content"],
                properties: {
                  rating: { type: "number", minimum: 1, maximum: 5 },
                  content: { type: "string", minLength: 1 },
                  // Allow other Review fields through
                  id: { type: "string" },
                  date: { type: "string" },
                  appVersion: { type: "string" },
                  sentiment: { type: "string" },
                  author: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: AnalyzeBody }>,
      reply: FastifyReply
    ): Promise<AnalyzeReviewsResponse | ApiErrorResponse> => {
      let { reviews } = request.body;

      // Truncate to limit silently — no need to error, just analyze what we can
      if (reviews.length > MAX_REVIEWS) {
        reviews = reviews.slice(0, MAX_REVIEWS);
      }

      try {
        const insights = await analyzeReviews(reviews);
        return reply.status(200).send({ insights } satisfies AnalyzeReviewsResponse);
      } catch (err) {
        if (err instanceof AIConfigError) {
          return reply.status(503).send({
            error:
              "AI analysis is not configured. Add OPENAI_API_KEY to the API environment.",
            code: "AI_NOT_CONFIGURED",
          } satisfies ApiErrorResponse);
        }

        if (err instanceof AITimeoutError) {
          return reply.status(504).send({
            error: "AI analysis timed out. Please try again.",
            code: "AI_TIMEOUT",
          } satisfies ApiErrorResponse);
        }

        if (err instanceof AIResponseError) {
          fastify.log.warn({ err }, "AI error");
          // Surface the real reason (credits, rate limit, bad response, etc.)
          return reply.status(502).send({
            error: err.message,
            code: "AI_ERROR",
          } satisfies ApiErrorResponse);
        }

        fastify.log.error(err);
        return reply.status(500).send({
          error: "An error occurred during AI analysis. Please try again.",
          code: "AI_ERROR",
        } satisfies ApiErrorResponse);
      }
    }
  );
};

export default analyzeRoutes;
