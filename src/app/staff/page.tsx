import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { StaffPanel } from "@/components/staff/staff-panel";
import { getBootstrapData, getPoolBoard } from "@/lib/data";
import { requireSession } from "@/lib/session";
import { buildHourRange, formatDateLabel } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StaffPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const { pools, organizations } = await getBootstrapData(session);
  const params = await searchParams;

  const poolId = typeof params.poolId === "string" && pools.some((pool) => pool.id === params.poolId)
    ? params.poolId
    : pools[0]?.id;

  if (!poolId) {
    throw new Error("No hay piscinas configuradas.");
  }

  const selectedPool = pools.find((pool) => pool.id === poolId)!;
  const availableHours = buildHourRange(selectedPool.startHour, selectedPool.endHour);
  const selectedDate = typeof params.date === "string" ? params.date : new Date().toISOString().slice(0, 10);
  const selectedHour = typeof params.hour === "string" && availableHours.includes(params.hour)
    ? params.hour
    : availableHours[0]!;

  const board = await getPoolBoard(selectedDate, selectedHour, poolId);

  return (
    <AppShell
      session={session}
      currentPath="/staff"
      title="Panel operativo staff"
      description="Carga por hora lo que sucede en cada carril y mantén el layout de la piscina actualizado para supervisión inmediata."
      actions={<Badge className="bg-cyan-100 text-cyan-900 ring-cyan-200">{formatDateLabel(selectedDate)}</Badge>}
    >
      <StaffPanel
        pools={pools}
        organizations={organizations}
        board={board}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        availableHours={availableHours}
      />
    </AppShell>
  );
}
