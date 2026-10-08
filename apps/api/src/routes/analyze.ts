import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import type {
  Review,
  AnalyzeReviewsResponse,
  ApiErrorResponse,
} from "@reviewlens/shared";
import {
  analyzeReviews,
  AnalysisError,
} from "../services/review-analysis.service.js";

const MAX_REVIEWS = 200;

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

      // Truncate silently — analyse what we can
      if (reviews.length > MAX_REVIEWS) {
        reviews = reviews.slice(0, MAX_REVIEWS);
      }

      try {
        const insights = await analyzeReviews(reviews);
        return reply
          .status(200)
          .send({ insights } satisfies AnalyzeReviewsResponse);
      } catch (err) {
        if (err instanceof AnalysisError) {
          fastify.log.warn({ err }, "Analysis error");
          return reply.status(422).send({
            error: err.message,
            code: "INVALID_INPUT",
          } satisfies ApiErrorResponse);
        }

        fastify.log.error(err);
        return reply.status(500).send({
          error: "An error occurred during analysis. Please try again.",
          code: "AI_ERROR",
        } satisfies ApiErrorResponse);
      }
    }
  );
};

export default analyzeRoutes;
