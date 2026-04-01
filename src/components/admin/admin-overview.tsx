"use client";

import Link from "next/link";
import { startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChartColumn,
  Clock3,
  Gauge,
  Settings2,
  TrendingUp,
  UsersRound,
  Waves
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { LiveRefresh } from "@/components/live-refresh";
import { PoolLayout } from "@/components/pool/pool-layout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { OCCUPANCY_LABELS, OCCUPANCY_STYLES } from "@/lib/constants";
import { formatDateLabel, formatHourLabel } from "@/lib/utils";
import type { DashboardMetrics, Organization, Pool, PoolBoard } from "@/lib/types";

interface AdminOverviewProps {
  pools: Pool[];
  organizations: Organization[];
  boards: PoolBoard[];
  metrics: DashboardMetrics;
  selectedDate: string;
  selectedHour: string;
  availableHours: string[];
}

const EMPTY_CATEGORY_TOTALS = {
  academia: 0,
  club: 0,
  seleccionados: 0,
  libre: 0
};

export function AdminOverview({ boards, metrics, selectedDate, selectedHour, availableHours }: AdminOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateSearchParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      router.replace(`/admin?${params.toString()}`);
    });
  }

  const dateLabel = formatDateLabel(selectedDate);
  const blockSwimmers = boards.reduce((total, board) => total + board.totals.swimmers, 0);
  const activeLaneCount = boards.reduce(
    (total, board) => total + board.lanes.filter((lane) => lane.swimmerCount > 0).length,
    0
  );
  const activePoolCount = boards.filter((board) => board.totals.swimmers > 0).length;
  const busiestPool = [...boards].sort((left, right) => right.totals.swimmers - left.totals.swimmers)[0] ?? null;
  const leadCategory = [...metrics.categoryTotals].sort((left, right) => right.swimmers - left.swimmers)[0] ?? null;
  const currentBlockCategoryTotals = boards.reduce(
    (totals, board) => ({
      academia: totals.academia + board.totals.byCategory.academia,
      club: totals.club + board.totals.byCategory.club,
      seleccionados: totals.seleccionados + board.totals.byCategory.seleccionados,
      libre: totals.libre + board.totals.byCategory.libre
    }),
    EMPTY_CATEGORY_TOTALS
  );
  const hasHourlyActivity = metrics.hourlyTotals.some((entry) => entry.total > 0);
  const topOrganizations = metrics.organizationRanking.slice(0, 5);
  const poolComparison = metrics.poolComparison.slice(0, 4);
  const maxPoolSwimmers = Math.max(...poolComparison.map((entry) => entry.swimmers), 1);

  return (
    <>
      <LiveRefresh intervalMs={25000} />

      <section className="grid gap-5">
        <Card className="overflow-hidden border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-0">
          <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(430px,0.8fr)] xl:items-start">
            <div className="grid gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-cyan-100 text-cyan-900 ring-cyan-200">Centro admin</Badge>
                <Badge className="bg-emerald-100 text-emerald-900 ring-emerald-200">Supervisión en vivo</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-surf">Panel principal</p>
                <h3 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-ink md:text-[2rem]">
                  Control visual ordenado para revisar piscinas, hora pico y carga del día.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[15px]">
                  La vista prioriza primero el estado actual y debajo deja el análisis diario para que no se aplaste la operación.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <CalendarDays size={16} className="text-surf" />
                    Fecha observada
                  </div>
                  <p className="mt-3 text-lg font-black text-ink">{dateLabel}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Clock3 size={16} className="text-surf" />
                    Hora activa
                  </div>
                  <p className="mt-3 text-lg font-black text-ink">{formatHourLabel(selectedHour)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Waves size={16} className="text-surf" />
                    Piscinas activas
                  </div>
                  <p className="mt-3 text-lg font-black text-ink">{activePoolCount} / {boards.length}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-900/70 bg-gradient-to-br from-ink via-slate-900 to-sky-900 p-5 text-white shadow-lg shadow-slate-900/15">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white/70">Nadadores en el bloque</p>
                  <UsersRound size={18} className="text-white/85" />
                </div>
                <p className="mt-4 text-4xl font-black">{blockSwimmers}</p>
                <p className="mt-2 text-sm text-white/70">distribuidos ahora entre ambas piscinas</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">Carriles con carga</p>
                  <Activity size={18} className="text-surf" />
                </div>
                <p className="mt-4 text-3xl font-black text-ink">{activeLaneCount}</p>
                <p className="mt-2 text-sm text-slate-500">carriles con ocupación registrada</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">Hora pico del día</p>
                  <TrendingUp size={18} className="text-amber-500" />
                </div>
                <p className="mt-4 text-3xl font-black text-ink">
                  {metrics.peakHour ? formatHourLabel(metrics.peakHour.label) : "Sin pico"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {metrics.peakHour ? `${metrics.peakHour.swimmers} nadadores` : "Aún no hay acumulado"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">Categoría líder</p>
                  <Gauge size={18} className="text-emerald-500" />
                </div>
                <p className="mt-4 text-2xl font-black text-ink">
                  {leadCategory && leadCategory.swimmers > 0 ? OCCUPANCY_LABELS[leadCategory.category] : "Sin carga"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {leadCategory && leadCategory.swimmers > 0
                    ? `${leadCategory.swimmers} nadadores acumulados`
                    : "No hay actividad registrada"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="grid content-start gap-5 border-slate-200/80 bg-slate-50/70 p-5 md:p-6">
            <div>
              <p className="text-sm font-semibold text-surf">Centro de control</p>
              <h3 className="mt-1 text-2xl font-black text-ink">Fecha y hora</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Cambia el bloque operativo y revisa un resumen rápido antes de bajar a las piscinas.
              </p>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Fecha
              <Input type="date" value={selectedDate} onChange={(event) => updateSearchParam("date", event.target.value)} />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Hora</span>
              <div className="hour-scroll flex gap-2 overflow-x-auto pb-2">
                {availableHours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => updateSearchParam("hour", hour)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      hour === selectedHour
                        ? "bg-ink text-white shadow-sm"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {formatHourLabel(hour)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-surf">Bloque seleccionado</p>
                  <h4 className="mt-2 text-xl font-black text-ink">{formatHourLabel(selectedHour)}</h4>
                </div>
                <Badge className="bg-ink text-white ring-ink/10">{blockSwimmers} nadadores</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {busiestPool && busiestPool.totals.swimmers > 0
                  ? `${busiestPool.pool.name} concentra ${busiestPool.totals.swimmers} nadadores en este bloque.`
                  : "No hay actividad cargada para la hora seleccionada."}
              </p>
            </div>

            <div className="grid gap-3">
              {boards.map((board) => {
                const boardActiveLanes = board.lanes.filter((lane) => lane.swimmerCount > 0).length;

                return (
                  <div key={board.pool.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-surf">Piscina</p>
                        <h4 className="mt-1 text-lg font-black text-ink">{board.pool.name}</h4>
                        <p className="mt-1 text-sm text-slate-500">{board.pool.type} - {board.pool.laneCount} carriles</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 ring-slate-200">{board.totals.swimmers} nadadores</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <p className="text-slate-500">Carriles activos</p>
                        <p className="mt-1 text-lg font-black text-ink">{boardActiveLanes}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-3">
                        <p className="text-slate-500">Piscina libre</p>
                        <p className="mt-1 text-lg font-black text-ink">{board.totals.byCategory.libre}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="grid gap-5 border-slate-200/80 p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-surf">Vista operativa</p>
                <h3 className="mt-1 text-2xl font-black text-ink">Piscinas supervisadas</h3>
                <p className="mt-2 text-sm text-slate-500">
                  El layout de las piscinas ocupa el ancho principal y el análisis queda abajo para evitar compresión.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(currentBlockCategoryTotals) as Array<[
                  keyof typeof currentBlockCategoryTotals,
                  number
                ]>).map(([category, swimmers]) => (
                  <Badge key={category} className={OCCUPANCY_STYLES[category].badge}>
                    {OCCUPANCY_LABELS[category]}: {swimmers}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 2xl:grid-cols-2">
              {boards.map((board) => (
                <Card key={board.pool.id} className="bg-gradient-to-br from-white to-cyan-50/40 p-4 md:p-6">
                  <PoolLayout
                    pool={board.pool}
                    lanes={board.lanes}
                    compact={false}
                    showLegend={false}
                    caption="Piscina supervisada"
                    rightLabel={`${board.totals.swimmers} nadadores`}
                  />
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                    <Badge className="justify-center bg-cyan-100 text-cyan-900 ring-cyan-200">Academia: {board.totals.byCategory.academia}</Badge>
                    <Badge className="justify-center bg-blue-100 text-blue-900 ring-blue-200">Club: {board.totals.byCategory.club}</Badge>
                    <Badge className="justify-center bg-amber-100 text-amber-900 ring-amber-200">Seleccionados: {board.totals.byCategory.seleccionados}</Badge>
                    <Badge className="justify-center bg-emerald-100 text-emerald-900 ring-emerald-200">Libre: {board.totals.byCategory.libre}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <Card className="grid gap-5 border-slate-200/80 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-surf">Análisis del día</p>
                <h3 className="mt-1 text-xl font-black text-ink">Carga por hora</h3>
              </div>
              <ChartColumn size={18} className="text-surf" />
            </div>

            <div className="chart-shell relative h-[280px] rounded-3xl border border-slate-100 bg-slate-50/60 p-3">
              {hasHourlyActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.hourlyTotals} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis dataKey="hour" tickFormatter={formatHourLabel} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value ?? 0)} nadadores`,
                        OCCUPANCY_LABELS[name as keyof typeof OCCUPANCY_LABELS] ?? String(name)
                      ]}
                      labelFormatter={(label) => formatHourLabel(String(label))}
                    />
                    <Bar dataKey="academia" stackId="load" fill="#06b6d4" />
                    <Bar dataKey="club" stackId="load" fill="#2563eb" />
                    <Bar dataKey="seleccionados" stackId="load" fill="#f59e0b" />
                    <Bar dataKey="libre" stackId="load" radius={[10, 10, 0, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white/70 text-center text-sm text-slate-500">
                  Sin movimientos registrados para esta fecha.
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.categoryTotals.map((entry) => {
                const percentage = metrics.totalSwimmers > 0 ? Math.round((entry.swimmers / metrics.totalSwimmers) * 100) : 0;
                const width = entry.swimmers > 0 ? Math.max(percentage, 8) : 0;

                return (
                  <div key={entry.category} className="grid gap-2 rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">{OCCUPANCY_LABELS[entry.category]}</span>
                      <span className="text-slate-500">{entry.swimmers}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white">
                      <div className={`${OCCUPANCY_STYLES[entry.category].accent} h-2 rounded-full`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="grid gap-5 border-slate-200/80 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-surf">Monitoreo rápido</p>
                <h3 className="mt-1 text-xl font-black text-ink">Organizaciones y piscinas</h3>
              </div>
              <UsersRound size={18} className="text-surf" />
            </div>

            <div className="grid gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Ranking actual</p>
                <p className="text-sm text-slate-500">Participación acumulada del día</p>
              </div>
              {topOrganizations.length > 0 ? (
                topOrganizations.map((entry, index) => (
                  <div key={entry.organizationName} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-700">#{index + 1} {entry.organizationName}</p>
                      <p className="text-slate-500">Carga acumulada</p>
                    </div>
                    <span className="text-base font-black text-ink">{entry.swimmers}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  Aún no hay organizaciones con actividad registrada.
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Comparativo por piscina</p>
                <p className="text-sm text-slate-500">Total acumulado del día por cada vaso</p>
              </div>
              {poolComparison.length > 0 ? (
                poolComparison.map((entry) => (
                  <div key={entry.poolName} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">{entry.poolName}</span>
                      <span className="font-black text-ink">{entry.swimmers}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-surf to-cyan-400"
                        style={{ width: `${Math.max((entry.swimmers / maxPoolSwimmers) * 100, entry.swimmers > 0 ? 10 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  Sin datos acumulados para comparar piscinas.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/admin/reportes" className="block">
            <Card className="flex h-full items-center justify-between gap-3 border-slate-900/60 !bg-ink text-white transition hover:-translate-y-0.5 hover:shadow-float-hover">
              <div>
                <p className="text-sm text-white/70">Detalle histórico</p>
                <h4 className="mt-1 text-xl font-black">Ir a reportes</h4>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <ChartColumn size={20} />
                <ArrowUpRight size={18} />
              </div>
            </Card>
          </Link>
          <Link href="/admin/configuracion" className="block">
            <Card className="flex h-full items-center justify-between gap-3 border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-float-hover">
              <div>
                <p className="text-sm text-slate-500">Catálogos y ajustes</p>
                <h4 className="mt-1 text-xl font-black text-ink">Configuración</h4>
              </div>
              <div className="flex items-center gap-2 text-surf">
                <Settings2 size={20} />
                <ArrowUpRight size={18} />
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </>
  );
}