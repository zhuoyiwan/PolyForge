import { describe, expect, it } from "vitest";
import { buildDoctorAdvice } from "../src/commands/doctor";

describe("doctor advice", () => {
  it("returns targeted warning for springboot without maven", () => {
    const checks = {
      java: { name: "java", ok: true, output: "java 17" },
      mvn: { name: "mvn", ok: false, output: "missing" },
    } as const;

    const advices = buildDoctorAdvice(checks as never, { backend: "springboot" });
    expect(advices.some((item) => item.label === "maven" && item.status === "warn")).toBe(true);
  });

  it("returns python-worker advice", () => {
    const checks = {
      python3: { name: "python3", ok: true, output: "Python 3.12" },
    } as const;

    const advices = buildDoctorAdvice(checks as never, { modules: "python-worker" });
    expect(advices.some((item) => item.label === "python-worker")).toBe(true);
  });
});
