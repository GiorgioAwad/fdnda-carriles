import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { AdminOverview } from "@/components/admin/admin-overview";
import { getBootstrapData, getDashboard, getPoolBoard } from "@/lib/data";
import { requireSession } from "@/lib/session";
import { buildHourRange } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await requireSession("admin");
  const { pools, organizations } = await getBootstrapData(session);
  const params = await searchParams;
  const selectedDate = typeof params.date === "string" ? params.date : new Date().toISOString().slice(0, 10);
  const basePool = pools[0];

  if (!basePool) {
    throw new Error("No hay piscinas configuradas.");
  }

  const availableHours = buildHourRange(basePool.startHour, basePool.endHour);
  const selectedHour = typeof params.hour === "string" && availableHours.includes(params.hour)
    ? params.hour
    : availableHours[0]!;

  const [boards, metrics] = await Promise.all([
    Promise.all(pools.map((pool) => getPoolBoard(selectedDate, selectedHour, pool.id))),
    getDashboard({
      from: selectedDate,
      to: selectedDate,
      category: "all"
    })
  ]);

  return (
    <AppShell
      session={session}
      currentPath="/admin"
      title="Panel admin en vivo"
      description="Supervisa la ocupación cargada por staff, revisa totales del día y detecta rápidamente horas o grupos de mayor demanda."
      actions={<Badge className="bg-amber-100 text-amber-900 ring-amber-200">Supervisión activa</Badge>}
    >
      <AdminOverview
        pools={pools}
        organizations={organizations}
        boards={boards}
        metrics={metrics}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        availableHours={availableHours}
      />
    </AppShell>
  );
}
