export type UserRole = "staff" | "admin";
export type OccupancyCategory = "academia" | "club" | "seleccionados" | "libre";
export type OrganizationType = Exclude<OccupancyCategory, "libre">;
export type PoolType = "50m" | "25m";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Pool {
  id: string;
  type: PoolType;
  name: string;
  laneCount: number;
  startHour: string;
  endHour: string;
}

export interface Lane {
  id: string;
  poolId: string;
  number: number;
  label: string;
  active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  active: boolean;
}

export interface LaneAssignment {
  id: string;
  date: string;
  hour: string;
  poolId: string;
  laneId: string;
  laneNumber: number;
  category: OccupancyCategory;
  organizationId: string | null;
  swimmerCount: number;
  notes: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LaneAssignmentFormValue {
  laneId: string;
  laneNumber: number;
  category: OccupancyCategory;
  organizationId: string | null;
  swimmerCount: number;
  notes: string;
}

export interface LaneAssignmentView extends LaneAssignmentFormValue {
  laneLabel: string;
  organizationName: string | null;
}

export interface PoolBoard {
  pool: Pool;
  lanes: LaneAssignmentView[];
  totals: {
    swimmers: number;
    byCategory: Record<OccupancyCategory, number>;
  };
}

export interface DashboardFilters {
  from: string;
  to: string;
  poolId?: string;
  category?: OccupancyCategory | "all";
  organizationId?: string | "all";
}

export interface DashboardMetrics {
  totalSwimmers: number;
  occupiedSlots: number;
  peakHour: {
    label: string;
    swimmers: number;
  } | null;
  categoryTotals: Array<{ category: OccupancyCategory; swimmers: number }>;
  hourlyTotals: Array<{
    hour: string;
    academia: number;
    club: number;
    seleccionados: number;
    libre: number;
    total: number;
  }>;
  poolComparison: Array<{ poolName: string; swimmers: number }>;
  organizationRanking: Array<{ organizationName: string; swimmers: number }>;
  poolHeatmap: Array<{ poolName: string; hour: string; swimmers: number }>;
}

export interface UserFormValue {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  password?: string;
}

export interface OrganizationFormValue {
  id?: string;
  name: string;
  type: OrganizationType;
  active: boolean;
}

export interface PoolSettingsValue {
  id: string;
  name: string;
  laneCount: number;
  startHour: string;
  endHour: string;
}

export interface AppBootstrap {
  session: SessionUser;
  pools: Pool[];
  organizations: Organization[];
  profiles: Profile[];
  selectedDate: string;
  selectedHour: string;
}
