import { z } from "zod";

export const serviceTypeSchema = z.enum([
  "API",
  "WORKER",
  "DATABASE",
  "CACHE",
  "LOAD_BALANCER",
  "QUEUE",
  "STORAGE",
  "EXTERNAL",
]);

export const environmentSchema = z.enum([
  "development",
  "staging",
  "production",
]);

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Service name is required")
    .max(100, "Service name must be 100 characters or fewer"),

  type: serviceTypeSchema,

  status: z
    .enum(["HEALTHY", "DEGRADED", "DOWN"])
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),

  environment: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  provider: z
    .string()
    .trim()
    .max(100)
    .optional(),

  region: z
    .string()
    .trim()
    .max(100)
    .optional(),

  positionX: z.number().finite().optional(),
  positionY: z.number().finite().optional(),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Service name is required")
    .max(100, "Service name must be 100 characters or fewer")
    .optional(),

  type: serviceTypeSchema.optional(),

  status: z
    .enum(["HEALTHY", "DEGRADED", "DOWN"])
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .nullable()
    .optional(),

  environment: environmentSchema.optional(),

  provider: z
    .string()
    .trim()
    .max(100, "Provider must be 100 characters or fewer")
    .nullable()
    .optional(),

  region: z
    .string()
    .trim()
    .max(100, "Region must be 100 characters or fewer")
    .nullable()
    .optional(),

  positionX: z.number().finite().optional(),
  positionY: z.number().finite().optional(),
});

export type CreateServiceInput = z.infer<
  typeof createServiceSchema
>;

export type UpdateServiceInput = z.infer<
  typeof updateServiceSchema
>;