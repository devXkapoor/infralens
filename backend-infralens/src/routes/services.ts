import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../schemas/service.js";

export async function serviceRoutes(app: FastifyInstance) {
  app.get("/projects/:projectId/services", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const services = await prisma.service.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      services,
    };
  });

  app.post("/projects/:projectId/services", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const result = createServiceSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: result.error.issues,
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return reply.status(404).send({
        error: "Project not found",
      });
    }

    const service = await prisma.service.create({
      data: {
        projectId,
        name: result.data.name,
        type: result.data.type,

        ...(result.data.description !== undefined
          ? { description: result.data.description }
          : {}),

        ...(result.data.environment !== undefined
          ? { environment: result.data.environment }
          : {}),

        ...(result.data.provider !== undefined
          ? { provider: result.data.provider }
          : {}),

        ...(result.data.region !== undefined
          ? { region: result.data.region }
          : {}),

        ...(result.data.positionX !== undefined
          ? { positionX: result.data.positionX }
          : {}),

        ...(result.data.positionY !== undefined
          ? { positionY: result.data.positionY }
          : {}),
      },
    });
    return reply.status(201).send({
      service,
    });
  });

  app.patch(
    "/projects/:projectId/services/:serviceId",
    async (request, reply) => {
      const { projectId, serviceId } = request.params as {
        projectId: string;
        serviceId: string;
      };

      const result = updateServiceSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({
          error: "Invalid request body",
          details: result.error.issues,
        });
      }

      const existingService = await prisma.service.findFirst({
        where: {
          id: serviceId,
          projectId,
        },
        select: {
          id: true,
        },
      });

      if (!existingService) {
        return reply.status(404).send({
          error: "Service not found",
        });
      }

      const service = await prisma.service.update({
        where: {
          id: serviceId,
        },
        data: {
          ...(result.data.name !== undefined
            ? { name: result.data.name }
            : {}),

          ...(result.data.type !== undefined
            ? { type: result.data.type }
            : {}),

          ...(result.data.status !== undefined
            ? { status: result.data.status }
            : {}),

          ...(result.data.description !== undefined
            ? { description: result.data.description }
            : {}),

          ...(result.data.environment !== undefined
            ? { environment: result.data.environment }
            : {}),

          ...(result.data.provider !== undefined
            ? { provider: result.data.provider }
            : {}),

          ...(result.data.region !== undefined
            ? { region: result.data.region }
            : {}),

          ...(result.data.positionX !== undefined
            ? { positionX: result.data.positionX }
            : {}),

          ...(result.data.positionY !== undefined
            ? { positionY: result.data.positionY }
            : {}),
        },
      });

      return {
        service,
      };
    },
  );

}
