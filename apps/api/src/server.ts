import Fastify from "fastify";
import type { HealthResponse } from "@reviewlens/shared";

const app = Fastify({
  logger: true,
});

app.get("/health", async (): Promise<HealthResponse> => {
  return {
    status: "ok",
  };
});

const start = async () => {
  try {
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
