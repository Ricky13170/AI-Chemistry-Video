import type { JobConfig, JobResult } from "./types";

export function createDemoResult(config: JobConfig): JobResult {
  return {
    is_demo: true,
    summary: `Demo outline for ${config.chemical}. No chemical facts have been verified and no media file has been generated.`,
    script_sections: [
      {
        title: "Opening — spark curiosity",
        body: `Introduce ${config.chemical} and frame a question for the audience.`,
      },
      {
        title: "Explore — make science visual",
        body: "Structure, properties, and uses will be written from verified references in the real pipeline.",
      },
      {
        title: "Closing — key takeaways",
        body: "Summarize reviewed concepts and display their references.",
      },
    ],
    sources: [],
    artifacts: [],
  };
}
