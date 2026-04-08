import { describe, expect, it } from "vitest";
import { buildDashboardMetrics } from "@/lib/reports";
import type { DashboardFilters, LaneAssignment, Organization, Pool } from "@/lib/types";

const pools: Pool[] = [
  { id: "pool_50", type: "50m", name: "Piscina 50m", laneCount: 8, startHour: "05:00", endHour: "22:00" },
  { id: "pool_25", type: "25m", name: "Piscina 25m", laneCount: 8, startHour: "05:00", endHour: "22:00" }
];

const organizations: Organization[] = [
  { id: "org_a", name: "Academia Tritones", type: "academia", active: true },
  { id: "org_c", name: "Club Pacífico", type: "club", active: true }
];

const assignments: LaneAssignment[] = [
  {
    id: "asg_1",
    date: "2026-03-20",
    hour: "08:00",
    poolId: "pool_50",
    laneId: "lane_1",
    laneNumber: 1,
    category: "academia",
    organizationId: "org_a",
    swimmerCount: 10,
    notes: "",
    startDate: null,
    endDate: null,
    createdBy: "u1",
    updatedBy: "u1",
    createdAt: "2026-03-20T08:00:00.000Z",
    updatedAt: "2026-03-20T08:00:00.000Z"
  },
  {
    id: "asg_2",
    date: "2026-03-20",
    hour: "08:00",
    poolId: "pool_25",
    laneId: "lane_2",
    laneNumber: 2,
    category: "club",
    organizationId: "org_c",
    swimmerCount: 6,
    notes: "",
    startDate: null,
    endDate: null,
    createdBy: "u1",
    updatedBy: "u1",
    createdAt: "2026-03-20T08:00:00.000Z",
    updatedAt: "2026-03-20T08:00:00.000Z"
  },
  {
    id: "asg_3",
    date: "2026-03-20",
    hour: "09:00",
    poolId: "pool_50",
    laneId: "lane_3",
    laneNumber: 3,
    category: "libre",
    organizationId: null,
    swimmerCount: 4,
    notes: "",
    startDate: null,
    endDate: null,
    createdBy: "u1",
    updatedBy: "u1",
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z"
  }
];

const filters: DashboardFilters = {
  from: "2026-03-20",
  to: "2026-03-20",
  category: "all"
};

describe("buildDashboardMetrics", () => {
  it("calcula totales, hora pico y ranking de organizaciones", () => {
    const metrics = buildDashboardMetrics(assignments, pools, organizations, filters);

    expect(metrics.totalSwimmers).toBe(20);
    expect(metrics.occupiedSlots).toBe(3);
    expect(metrics.peakHour?.label).toBe("08:00");
    expect(metrics.peakHour?.swimmers).toBe(16);
    expect(metrics.categoryTotals.find((entry) => entry.category === "academia")?.swimmers).toBe(10);
    expect(metrics.organizationRanking[0]?.organizationName).toBe("Academia Tritones");
  });
});
