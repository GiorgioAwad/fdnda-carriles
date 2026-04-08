"use client";

import { startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { OCCUPANCY_LABELS } from "@/lib/constants";
import { formatHourLabel } from "@/lib/utils";
import type { DashboardMetrics, OccupancyCategory, Organization, Pool } from "@/lib/types";

const chartColors = {
  academia: "#06b6d4",
  club: "#3b82f6",
  seleccionados: "#f59e0b",
  libre: "#10b981"
};

interface AdminReportsProps {
  metrics: DashboardMetrics;
  pools: Pool[];
  organizations: Organization[];
  filters: {
    from: string;
    to: string;
    poolId?: string;
    category?: string;
    organizationId?: string;
  };
}

function resolveCategoryLabel(value: unknown) {
  return typeof value === "string" && value in OCCUPANCY_LABELS
    ? OCCUPANCY_LABELS[value as OccupancyCategory]
    : "Categoría";
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full w-full min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-6 text-center">
      <div className="max-w-sm">
        <p className="text-base font-bold text-ink">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function AdminReports({ metrics, pools, organizations, filters }: AdminReportsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.replace(`/admin/reportes?${params.toString()}`);
    });
  }

  const hasHourlyData = metrics.hourlyTotals.some((entry) => entry.total > 0);
  const hasCategoryData = metrics.categoryTotals.some((entry) => entry.swimmers > 0);
  const hasOrganizationData = metrics.organizationRanking.some((entry) => entry.swimmers > 0);
  const hasHeatmapData = metrics.poolHeatmap.some((entry) => entry.swimmers > 0);
  const hasAnyData = metrics.totalSwimmers > 0 || metrics.occupiedSlots > 0;

  return (
    <section className="grid gap-4">
      <Card className="grid gap-4 lg:grid-cols-5">
        <Field label="Desde">
          <Input type="date" value={filters.from} onChange={(event) => updateFilter("from", event.target.value)} />
        </Field>
        <Field label="Hasta">
          <Input type="date" value={filters.to} onChange={(event) => updateFilter("to", event.target.value)} />
        </Field>
        <Field label="Piscina">
          <Select value={filters.poolId ?? "all"} onChange={(event) => updateFilter("poolId", event.target.value)}>
            <option value="all">Todas</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Categoría">
          <Select value={filters.category ?? "all"} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="all">Todas</option>
            {Object.entries(OCCUPANCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Organización">
          <Select value={filters.organizationId ?? "all"} onChange={(event) => updateFilter("organizationId", event.target.value)}>
            <option value="all">Todas</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {!hasAnyData ? (
        <Card className="border-slate-200/80 bg-slate-50/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-surf">Sin actividad para este filtro</p>
              <h3 className="mt-1 text-2xl font-black text-ink">No hay datos para mostrar en reportes</h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Cambia el rango de fechas o abre una piscina con actividad registrada. Los paneles de abajo se llenarán apenas existan cargas en ese periodo.
              </p>
            </div>
            <Badge className="bg-slate-100 text-slate-700 ring-slate-200">Rango vacío</Badge>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[30px] !bg-ink text-white">
          <p className="text-sm text-white/70">Nadadores filtrados</p>
          <p className="mt-4 text-4xl font-black">{metrics.totalSwimmers}</p>
          <p className="mt-2 text-sm text-white/72">en el rango actual</p>
        </Card>
        <Card className="rounded-[30px] bg-white">
          <p className="text-sm text-slate-500">Carriles ocupados</p>
          <p className="mt-4 text-4xl font-black text-ink">{metrics.occupiedSlots}</p>
          <p className="mt-2 text-sm text-slate-500">slots con actividad</p>
        </Card>
        <Card className="rounded-[30px] bg-white">
          <p className="text-sm text-slate-500">Hora más fuerte</p>
          <p className="mt-4 text-3xl font-black text-ink">
            {metrics.peakHour ? formatHourLabel(metrics.peakHour.label) : "-"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {metrics.peakHour ? `${metrics.peakHour.swimmers} nadadores` : "Sin datos"}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="chart-shell rounded-[30px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-surf">Tendencia por hora</p>
              <h3 className="text-xl font-black text-ink">Distribución acumulada</h3>
            </div>
            <Badge className="bg-blue-100 text-blue-900 ring-blue-200">Horas pico</Badge>
          </div>
          <div className="h-[360px]">
            {hasHourlyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.hourlyTotals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                  <XAxis dataKey="hour" tickFormatter={formatHourLabel} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={(label) => formatHourLabel(String(label))} />
                  <Legend />
                  <Bar dataKey="academia" stackId="a" fill={chartColors.academia} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="club" stackId="a" fill={chartColors.club} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="seleccionados" stackId="a" fill={chartColors.seleccionados} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="libre" stackId="a" fill={chartColors.libre} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel
                title="Sin distribución por hora"
                description="Todavía no hay bloques ocupados en el rango elegido. Cambia filtros para comparar horas con actividad."
              />
            )}
          </div>
        </Card>

        <Card className="chart-shell rounded-[30px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-surf">Peso por categoría</p>
              <h3 className="text-xl font-black text-ink">Mix de uso</h3>
            </div>
            <Badge className="bg-emerald-100 text-emerald-900 ring-emerald-200">Balance</Badge>
          </div>
          <div className="h-[360px]">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.categoryTotals} dataKey="swimmers" nameKey="category" innerRadius={82} outerRadius={122} paddingAngle={4}>
                    {metrics.categoryTotals.map((entry) => (
                      <Cell key={entry.category} fill={chartColors[entry.category]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, _name, entry) => [`${Number(value ?? 0)} nadadores`, resolveCategoryLabel(entry.payload.category)]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel
                title="Sin mezcla de categorías"
                description="Cuando existan registros en el periodo, aquí verás qué categoría domina la ocupación."
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.categoryTotals.map((entry) => (
              <Badge key={entry.category} className="bg-slate-100 text-slate-700 ring-slate-200">
                {OCCUPANCY_LABELS[entry.category]}: {entry.swimmers}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[30px] flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-semibold text-surf">Ranking</p>
            <h3 className="text-xl font-black text-ink">Organizaciones con más demanda</h3>
          </div>
          {hasOrganizationData ? (
            <div className="grid gap-3 flex-1">
              {metrics.organizationRanking.map((entry, index) => (
                <div key={entry.organizationName} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">#{index + 1} {entry.organizationName}</p>
                    <p className="text-xs text-slate-500">Acumulado en el rango</p>
                  </div>
                  <span className="text-lg font-black text-ink">{entry.swimmers}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1">
              <EmptyPanel
                title="Sin ranking disponible"
                description="Aún no hay organizaciones con demanda registrada para este rango o estos filtros."
              />
            </div>
          )}
        </Card>

        <Card className="rounded-[30px] flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-semibold text-surf">Mapa térmico</p>
            <h3 className="text-xl font-black text-ink">Piscina y hora</h3>
          </div>
          {hasHeatmapData ? (
            <div className="grid gap-3 md:grid-cols-2 flex-1">
              {metrics.poolHeatmap.map((entry) => (
                <div key={`${entry.poolName}-${entry.hour}`} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">{entry.poolName}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black text-ink">{entry.swimmers}</p>
                      <p className="text-sm text-slate-500">nadadores</p>
                    </div>
                    <Badge className="bg-ink text-white ring-ink/10">{formatHourLabel(entry.hour)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1">
              <EmptyPanel
                title="Sin mapa térmico"
                description="Todavía no hay combinaciones de piscina y hora con ocupación para este rango."
              />
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}