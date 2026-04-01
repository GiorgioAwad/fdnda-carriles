import type { OccupancyCategory, PoolType, UserRole } from "@/lib/types";

export const OCCUPANCY_LABELS: Record<OccupancyCategory, string> = {
  academia: "Academia",
  club: "Club",
  seleccionados: "Seleccionados",
  libre: "Piscina libre"
};

export const OCCUPANCY_STYLES: Record<
  OccupancyCategory,
  { badge: string; panel: string; accent: string }
> = {
  academia: {
    badge: "bg-cyan-100 text-cyan-900 ring-cyan-200",
    panel: "from-cyan-200/80 to-cyan-50/80 border-cyan-200/70",
    accent: "bg-cyan-500"
  },
  club: {
    badge: "bg-blue-100 text-blue-900 ring-blue-200",
    panel: "from-blue-200/80 to-blue-50/80 border-blue-200/70",
    accent: "bg-blue-500"
  },
  seleccionados: {
    badge: "bg-amber-100 text-amber-900 ring-amber-200",
    panel: "from-amber-200/80 to-amber-50/80 border-amber-200/70",
    accent: "bg-amber-500"
  },
  libre: {
    badge: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    panel: "from-emerald-200/80 to-emerald-50/80 border-emerald-200/70",
    accent: "bg-emerald-500"
  }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: "Staff",
  admin: "Admin"
};

export const POOL_TYPE_LABELS: Record<PoolType, string> = {
  "50m": "Piscina 50m",
  "25m": "Piscina 25m"
};

export const DEFAULT_DATE = "2026-03-20";
export const DEFAULT_HOUR = "08:00";

export const SESSION_COOKIE = "lane-control-session";
export const DEMO_CREDENTIALS = {
  staff: {
    email: "staff@fdnda.org",
    password: "staff123"
  },
  admin: {
    email: "admin@fdnda.org",
    password: "admin123"
  }
};
