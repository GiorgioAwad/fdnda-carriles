import { describe, expect, it } from "vitest";
import { normalizeDateValue, normalizeTimeValue } from "@/lib/utils";

describe("normalizeDateValue", () => {
  it("recorta fechas ISO provenientes de Neon", () => {
    expect(normalizeDateValue("2026-04-01T05:00:00.000Z")).toBe("2026-04-01");
  });

  it("convierte objetos Date a yyyy-mm-dd", () => {
    expect(normalizeDateValue(new Date("2026-04-01T05:00:00.000Z"))).toBe("2026-04-01");
  });
});

describe("normalizeTimeValue", () => {
  it("recorta horas con segundos a hh:mm", () => {
    expect(normalizeTimeValue("05:00:00")).toBe("05:00");
  });

  it("extrae hh:mm desde un objeto Date", () => {
    expect(normalizeTimeValue(new Date("2026-04-01T05:00:00.000Z"))).toBe("05:00");
  });
});
