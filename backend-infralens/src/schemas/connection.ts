import { z } from "zod";

export const createConnectionSchema = z.object({
  sourceId: z.string().min(1, "Source service is required"),
  targetId: z.string().min(1, "Target service is required"),

  type: z
    .string()
    .trim()
    .max(50, "Connection type must be 50 characters or fewer")
    .optional(),
});

export type CreateConnectionInput = z.infer<
  typeof createConnectionSchema
>;
