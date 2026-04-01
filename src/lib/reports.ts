import type {
  DashboardFilters,
  DashboardMetrics,
  LaneAssignment,
  OccupancyCategory,
  Organization,
  Pool
} from "@/lib/types";
import { categoryOrder } from "@/lib/utils";

const CATEGORIES: OccupancyCategory[] = ["academia", "club", "seleccionados", "libre"];

export function filterAssignments(
  assignments: LaneAssignment[],
  filters: DashboardFilters
) {
  return assignments.filter((assignment) => {
    if (assignment.date < filters.from || assignment.date > filters.to) {
      return false;
    }

    if (filters.poolId && assignment.poolId !== filters.poolId) {
      return false;
    }

    if (filters.category && filters.category !== "all" && assignment.category !== filters.category) {
      return false;
    }

    if (
      filters.organizationId &&
      filters.organizationId !== "all" &&
      assignment.organizationId !== filters.organizationId
    ) {
      return false;
    }

    return true;
  });
}

export function buildDashboardMetrics(
  assignments: LaneAssignment[],
  pools: Pool[],
  organizations: Organization[],
  filters: DashboardFilters
): DashboardMetrics {
  const filtered = filterAssignments(assignments, filters);
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]));
  const poolById = new Map(pools.map((pool) => [pool.id, pool]));

  const categoryTotals = CATEGORIES.map((category) => ({
    category,
    swimmers: filtered
      .filter((assignment) => assignment.category === category)
      .reduce((sum, assignment) => sum + assignment.swimmerCount, 0)
  })).sort((left, right) => categoryOrder(left.category) - categoryOrder(right.category));

  const hourlyMap = new Map<
    string,
    { hour: string; academia: number; club: number; seleccionados: number; libre: number; total: number }
  >();

  for (const assignment of filtered) {
    const current = hourlyMap.get(assignment.hour) ?? {
      hour: assignment.hour,
      academia: 0,
      club: 0,
      seleccionados: 0,
      libre: 0,
      total: 0
    };
    current[assignment.category] += assignment.swimmerCount;
    current.total += assignment.swimmerCount;
    hourlyMap.set(assignment.hour, current);
  }

  const hourlyTotals = Array.from(hourlyMap.values()).sort((left, right) =>
    left.hour.localeCompare(right.hour)
  );

  const peakHour = hourlyTotals.slice().sort((left, right) => right.total - left.total)[0];

  const poolTotals = new Map<string, number>();
  const organizationTotals = new Map<string, number>();
  const heatmapKey = new Map<string, number>();

  for (const assignment of filtered) {
    const pool = poolById.get(assignment.poolId);
    const poolName = pool?.name ?? assignment.poolId;
    poolTotals.set(poolName, (poolTotals.get(poolName) ?? 0) + assignment.swimmerCount);

    const organizationName = assignment.organizationId
      ? organizationById.get(assignment.organizationId)?.name ?? "Sin organización"
      : "Piscina libre";
    organizationTotals.set(
      organizationName,
      (organizationTotals.get(organizationName) ?? 0) + assignment.swimmerCount
    );

    const heatmapId = `${poolName}:${assignment.hour}`;
    heatmapKey.set(heatmapId, (heatmapKey.get(heatmapId) ?? 0) + assignment.swimmerCount);
  }

  return {
    totalSwimmers: filtered.reduce((sum, assignment) => sum + assignment.swimmerCount, 0),
    occupiedSlots: filtered.filter((assignment) => assignment.swimmerCount > 0).length,
    peakHour: peakHour
      ? {
          label: peakHour.hour,
          swimmers: peakHour.total
        }
      : null,
    categoryTotals,
    hourlyTotals,
    poolComparison: Array.from(poolTotals.entries()).map(([poolName, swimmers]) => ({
      poolName,
      swimmers
    })),
    organizationRanking: Array.from(organizationTotals.entries())
      .map(([organizationName, swimmers]) => ({ organizationName, swimmers }))
      .sort((left, right) => right.swimmers - left.swimmers)
      .slice(0, 8),
    poolHeatmap: Array.from(heatmapKey.entries())
      .map(([key, swimmers]) => {
        const [poolName, hour] = key.split(":");
        return { poolName, hour, swimmers };
      })
      .sort((left, right) =>
        left.poolName === right.poolName
          ? left.hour.localeCompare(right.hour)
          : left.poolName.localeCompare(right.poolName)
      )
  };
}
