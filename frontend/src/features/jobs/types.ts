import { z } from "zod";

export const jobConfigSchema = z.object({
  chemical: z
    .string()
    .trim()
    .min(1, "Enter a compound name or formula.")
    .max(70),
  output_type: z.enum(["video", "slides", "script"]),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]),
  duration_seconds: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  voice: z.enum(["female", "male"]),
  visual_style: z.enum(["illustration", "minimal", "classroom"]),
});
export const workflowSteps = [
  "identify",
  "research",
  "script",
  "review",
  "render",
] as const;
export const stepLabels = [
  "Identify",
  "Research",
  "Write script",
  "Review",
  "Render",
] as const;
export const outputLabels = {
  video: "video",
  slides: "slides",
  script: "script",
} as const;

const resultSchema = z.object({
  is_demo: z.boolean(),
  summary: z.string(),
  script_sections: z.array(z.object({ title: z.string(), body: z.string() })),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })),
  artifacts: z.array(
    z.object({
      kind: z.enum(["video", "slides", "script"]),
      url: z.string().url(),
      filename: z.string(),
    }),
  ),
});
export const jobSchema = z.object({
  id: z.string().min(1),
  config: jobConfigSchema,
  status: z.enum(["queued", "running", "completed", "failed", "cancelled"]),
  progress: z.number().min(0).max(100),
  current_step: z.enum(workflowSteps).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  error: z.string().nullable(),
  result: resultSchema.nullable(),
});
export const jobsPageSchema = z.object({
  items: z.array(jobSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});
export type JobConfig = z.infer<typeof jobConfigSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobsPage = z.infer<typeof jobsPageSchema>;
export type JobResult = z.infer<typeof resultSchema>;
export const defaultConfig: JobConfig = {
  chemical: "Water (H₂O)",
  output_type: "video",
  aspect_ratio: "16:9",
  duration_seconds: 60,
  voice: "female",
  visual_style: "illustration",
};
export const isActiveJob = (job: Job | null | undefined) =>
  job?.status === "queued" || job?.status === "running";
