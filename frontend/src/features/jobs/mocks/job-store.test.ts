import { describe, expect, it } from "vitest";
import { createJobStore } from "./job-store";
import { defaultConfig } from "../types";

describe("mock job lifecycle", () => {
  it("progresses through queued/running/completed and never invents a media artifact", () => {
    let now = Date.now();
    const store = createJobStore(undefined, () => now);
    const created = store.create(defaultConfig);
    expect(created.status).toBe("queued");
    now += 600;
    expect(store.get(created.id)).toMatchObject({
      status: "running",
      current_step: "identify",
    });
    now += 7_000;
    expect(store.get(created.id)).toMatchObject({
      status: "completed",
      progress: 100,
      result: { is_demo: true, artifacts: [], sources: [] },
    });
  });

  it("keeps cancelled jobs cancelled after their normal completion time", () => {
    let now = Date.now();
    const store = createJobStore(undefined, () => now);
    const created = store.create(defaultConfig);
    store.cancel(created.id);
    now += 20_000;
    expect(store.get(created.id)?.status).toBe("cancelled");
  });

  it("fails predictably and retries with a new id and the original configuration", () => {
    let now = Date.now();
    const store = createJobStore(undefined, () => now);
    const first = store.create({ ...defaultConfig, chemical: "fail-demo" });
    now += 4_000;
    expect(store.get(first.id)).toMatchObject({
      status: "failed",
      progress: 40,
    });
    const second = store.retry(first.id)!;
    expect(second.id).not.toBe(first.id);
    expect(second.config).toEqual(first.config);
    expect(second.status).toBe("queued");
  });

  it("restores valid jobs from storage and drops malformed records", () => {
    let value = "";
    const storage = {
      getItem: () => value,
      setItem: (_key: string, next: string) => {
        value = next;
      },
    };
    const first = createJobStore(storage).create(defaultConfig);
    value = JSON.stringify([...JSON.parse(value), { id: "invalid" }]);
    const restored = createJobStore(storage);
    expect(restored.list(10, 0).items.map((x) => x.id)).toEqual([first.id]);
    const copy = restored.get(first.id)!;
    copy.config.chemical = "changed externally";
    expect(restored.get(first.id)?.config.chemical).toBe(
      defaultConfig.chemical,
    );
  });

  it("works in memory if storage is unavailable", () => {
    const storage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };
    const store = createJobStore(storage);
    const job = store.create(defaultConfig);
    expect(store.get(job.id)?.id).toBe(job.id);
  });
});
