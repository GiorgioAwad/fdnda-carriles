import { AppShell } from "@/components/layout/app-shell";
import { AdminReports } from "@/components/admin/admin-reports";
import { Badge } from "@/components/ui/badge";
import { getBootstrapData, getDashboard } from "@/lib/data";
import { requireSession } from "@/lib/session";
import type { DashboardFilters } from "@/lib/types";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolveCategory(value: string | string[] | undefined): DashboardFilters["category"] {
  return typeof value === "string" && ["academia", "club", "seleccionados", "libre", "all"].includes(value)
    ? (value as DashboardFilters["category"])
    : "all";
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const session = await requireSession("admin");
  const { pools, organizations } = await getBootstrapData(session);
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const filters: DashboardFilters = {
    from: typeof params.from === "string" ? params.from : today,
    to: typeof params.to === "string" ? params.to : today,
    poolId: typeof params.poolId === "string" ? params.poolId : undefined,
    category: resolveCategory(params.category),
    organizationId: typeof params.organizationId === "string" ? params.organizationId : "all"
  };

  const metrics = await getDashboard(filters);

  return (
    <AppShell
      session={session}
      currentPath="/admin/reportes"
      title="Reportes y estadísticas"
      description="Analiza horas pico, distribución por categoría y comportamiento por piscina u organización para tomar decisiones operativas."
      actions={<Badge className="bg-blue-100 text-blue-900 ring-blue-200">Analítica operativa</Badge>}
    >
      <AdminReports metrics={metrics} pools={pools} organizations={organizations} filters={filters} />
    </AppShell>
  );
}
