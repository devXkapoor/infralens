import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;