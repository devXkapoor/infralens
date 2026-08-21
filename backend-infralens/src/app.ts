import Fastify from "fastify";
import cors from "@fastify/cors";
import { projectRoutes } from "./routes/projects.js";
import { serviceRoutes } from "./routes/services.js";
import { connectionRoutes } from "./routes/connections.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: true,
    methods: ["GET", "HEAD", "POST", "PATCH", "OPTIONS"],
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "infralens-backend",
    };
  });

  app.register(projectRoutes);
  app.register(serviceRoutes);
  app.register(connectionRoutes);

  return app;
}