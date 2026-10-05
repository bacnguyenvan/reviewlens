import "dotenv/config";
import Fastify from "fastify";
import type { HealthResponse } from "@reviewlens/shared";
import reviewRoutes from "./routes/reviews.js";
import analyzeRoutes from "./routes/analyze.js";

const app = Fastify({
  logger: true,
});

app.get("/health", async (): Promise<HealthResponse> => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await app.register(reviewRoutes);
    await app.register(analyzeRoutes);
    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
