import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { createConnectionSchema } from "../schemas/connection.js";

export async function connectionRoutes(app: FastifyInstance) {
  app.get("/projects/:projectId/connections", async (request) => {
    const { projectId } = request.params as {
      projectId: string;
    };

    const connections = await prisma.connection.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      connections,
    };
  });

  app.post(
    "/projects/:projectId/connections",
    async (request, reply) => {
      const { projectId } = request.params as {
        projectId: string;
      };

      const result = createConnectionSchema.safeParse(
        request.body,
      );

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

      if (result.data.sourceId === result.data.targetId) {
        return reply.status(400).send({
          error: "A service cannot connect to itself",
        });
      }

      const services = await prisma.service.findMany({
        where: {
          id: {
            in: [result.data.sourceId, result.data.targetId],
          },
          projectId,
        },
        select: {
          id: true,
        },
      });

      if (services.length !== 2) {
        return reply.status(400).send({
          error: "Both services must belong to the specified project",
        });
      }

      const connection = await prisma.connection.create({
        data: {
          projectId,
          sourceId: result.data.sourceId,
          targetId: result.data.targetId,
          ...(result.data.type !== undefined
            ? { type: result.data.type }
            : {}),
        },
        include: {
          source: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          target: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return reply.status(201).send({
        connection,
      });
    },
  );
}

