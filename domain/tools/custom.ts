import { z } from "zod";
import type { Tool } from "./types";

export const customToolInputSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(240),
  category: z.string().trim().min(2).max(40),
  durationMinutes: z.number().int().min(1).max(180).optional(),
  instructions: z.array(z.string().trim().min(1).max(240)).min(1).max(10),
  states: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1)
});

export type CustomToolInput = z.infer<typeof customToolInputSchema>;

export function createCustomTool(input: CustomToolInput): Tool {
  const parsed = customToolInputSchema.parse(input);

  return {
    id: `custom-${crypto.randomUUID()}`,
    ...parsed,
    provenance: "client-created"
  };
}
