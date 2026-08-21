import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { createProjectSchema } from "../schemas/project.js";

export async function projectRoutes(app: FastifyInstance) {
  app.get("/projects", async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      projects,
    };
  });

  app.post("/projects", async (request, reply) => {
    const result = createProjectSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const project = await prisma.project.create({
      data: {
        name: result.data.name,
        ...(result.data.description !== undefined
          ? { description: result.data.description }
          : {}),
      },
    });

    return reply.status(201).send({
      project,
    });
  });
}