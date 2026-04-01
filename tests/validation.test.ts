import { describe, expect, it } from "vitest";
import { laneAssignmentSchema } from "@/lib/validation";

describe("laneAssignmentSchema", () => {
  it("permite piscina libre sin organización", () => {
    const result = laneAssignmentSchema.safeParse({
      laneId: "lane_1",
      laneNumber: 1,
      category: "libre",
      organizationId: null,
      swimmerCount: 5,
      notes: "turno abierto"
    });

    expect(result.success).toBe(true);
  });

  it("rechaza club sin organización", () => {
    const result = laneAssignmentSchema.safeParse({
      laneId: "lane_2",
      laneNumber: 2,
      category: "club",
      organizationId: null,
      swimmerCount: 7,
      notes: ""
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("organización");
    }
  });
});
