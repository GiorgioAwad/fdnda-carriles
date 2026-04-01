"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, TimerReset, Waves, Users, BarChart3, X } from "lucide-react";
import { saveAssignmentsAction } from "@/app/actions";
import { LiveRefresh } from "@/components/live-refresh";
import { PoolLayout } from "@/components/pool/pool-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { OCCUPANCY_LABELS, OCCUPANCY_STYLES } from "@/lib/constants";
import { cn, formatDateLabel, formatHourLabel } from "@/lib/utils";
import type { Organization, Pool, PoolBoard } from "@/lib/types";

interface StaffPanelProps {
  pools: Pool[];
  organizations: Organization[];
  board: PoolBoard;
  selectedDate: string;
  selectedHour: string;
  availableHours: string[];
}

export function StaffPanel({
  pools,
  organizations,
  board,
  selectedDate,
  selectedHour,
  availableHours
}: StaffPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftLanes, setDraftLanes] = useState(board.lanes);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);

  const contextKey = `${selectedDate}-${selectedHour}-${board.pool.id}`;
  const [lastContext, setLastContext] = useState(contextKey);

  useEffect(() => {
    if (contextKey !== lastContext) {
      // User changed date/hour/pool, force reset
      setDraftLanes(board.lanes);
      setLastContext(contextKey);
      setIsDirty(false);
      setMessage(null);
      setSelectedLaneId(null);
    } else if (!isDirty) {
      // Same context, but server pushed new data (LiveRefresh) AND user is not editing
      setDraftLanes(board.lanes);
    }

    setSelectedLaneId((current) =>
      current && board.lanes.some((lane) => lane.laneId === current) ? current : null
    );
  }, [board, contextKey, lastContext, isDirty]);

  function updateSearchParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      router.replace(`/staff?${params.toString()}`);
    });
  }

  function updateLane(index: number, patch: Partial<(typeof draftLanes)[number]>) {
    setIsDirty(true);
    setDraftLanes((current) =>
      current.map((lane, laneIndex) => {
        if (laneIndex !== index) {
          return lane;
        }

        const next = { ...lane, ...patch };
        
        if ("organizationId" in patch) {
          if (!patch.organizationId) {
            next.organizationId = null;
            next.organizationName = null;
          } else {
            const org = organizations.find((o) => o.id === patch.organizationId);
            next.organizationName = org ? org.name : null;
          }
        }

        if (patch.category === "libre") {
          next.organizationId = null;
          next.organizationName = null;
        }
        return next;
      })
    );
  }

  function resetHour() {
    setDraftLanes(board.lanes);
    setIsDirty(false);
    setMessage("Se restauró el bloque a la última versión guardada.");
  }

  async function persistBoard() {
    setIsSaving(true);
    const result = await saveAssignmentsAction({
      date: selectedDate,
      hour: selectedHour,
      poolId: board.pool.id,
      assignments: draftLanes.map((lane) => ({
        laneId: lane.laneId,
        laneNumber: lane.laneNumber,
        category: lane.category,
        organizationId: lane.organizationId,
        swimmerCount: Number(lane.swimmerCount || 0),
        notes: lane.notes
      }))
    });

    setMessage(result.success ?? result.error ?? null);
    setIsSaving(false);
    if (result.success) {
      setIsDirty(false);
      router.refresh();
    }
  }

  const currentTotals = {
    swimmers: draftLanes.reduce((sum, lane) => sum + Number(lane.swimmerCount || 0), 0),
    academia: draftLanes
      .filter((lane) => lane.category === "academia")
      .reduce((sum, lane) => sum + Number(lane.swimmerCount || 0), 0),
    club: draftLanes
      .filter((lane) => lane.category === "club")
      .reduce((sum, lane) => sum + Number(lane.swimmerCount || 0), 0),
    seleccionados: draftLanes
      .filter((lane) => lane.category === "seleccionados")
      .reduce((sum, lane) => sum + Number(lane.swimmerCount || 0), 0),
    libre: draftLanes
      .filter((lane) => lane.category === "libre")
      .reduce((sum, lane) => sum + Number(lane.swimmerCount || 0), 0)
  };

  const occupiedLanes = draftLanes.filter((lane) => lane.swimmerCount > 0).length;

  const selectedLaneIndex = draftLanes.findIndex((lane) => lane.laneId === selectedLaneId);
  const selectedLane = selectedLaneIndex >= 0 ? draftLanes[selectedLaneIndex] : null;
  const selectedLaneStyle = selectedLane ? OCCUPANCY_STYLES[selectedLane.category] : null;
  const organizationOptions = selectedLane
    ? organizations.filter((organization) => organization.type === selectedLane.category)
    : [];

  return (
    <>
      <LiveRefresh intervalMs={45000} />
      <section className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="grid gap-5">
          {/* Pool block header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ink to-ocean text-white shadow-lg">
              <Waves size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-surf">Bloque operativo</p>
              <h3 className="text-xl font-black text-ink">{board.pool.name}</h3>
            </div>
          </div>

          {/* Date + Pool selectors */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Field label="Fecha">
              <Input type="date" value={selectedDate} onChange={(event) => updateSearchParam("date", event.target.value)} />
            </Field>
            <div className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Piscina</span>
              <div className="grid grid-cols-2 gap-2">
                {pools.map((pool) => (
                  <button
                    key={pool.id}
                    type="button"
                    onClick={() => updateSearchParam("poolId", pool.id)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                      pool.id === board.pool.id
                        ? "bg-ink text-white shadow-float scale-[1.02]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-[1.02]"
                    )}
                  >
                    {pool.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hour selector with gradient fade */}
          <div className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Hora</span>
            <div className="hour-scroll flex gap-2 overflow-x-auto pb-1">
              {availableHours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => updateSearchParam("hour", hour)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    hour === selectedHour
                      ? "bg-surf text-white shadow-[0_4px_16px_rgba(15,139,168,0.35)] scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                  )}
                >
                  {formatHourLabel(hour)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <Card className="relative overflow-hidden rounded-[24px] !bg-ink text-white">
              <div className="animate-water-shimmer pointer-events-none absolute inset-0" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-white/60" />
                  <p className="text-sm text-white/68">Carga estimada</p>
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="text-4xl font-black tabular-nums">{currentTotals.swimmers}</p>
                  <p className="text-sm text-white/72">nadadores</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
                  <BarChart3 size={12} />
                  <span>{occupiedLanes} de {draftLanes.length} carriles ocupados</span>
                </div>
              </div>
            </Card>
            <Card className="rounded-[24px] bg-gradient-to-br from-white to-cyan-50/80">
              <p className="text-sm font-semibold text-slate-600">Resumen por categoría</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(currentTotals)
                  .filter(([key]) => key !== "swimmers")
                  .map(([key, value]) => (
                    <Badge
                      key={key}
                      className={cn(
                        OCCUPANCY_STYLES[key as keyof typeof OCCUPANCY_STYLES].badge,
                        "transition-all duration-200 hover:scale-105",
                        value > 0 ? "" : "opacity-50"
                      )}
                    >
                      {OCCUPANCY_LABELS[key as keyof typeof OCCUPANCY_LABELS]}: {value}
                    </Badge>
                  ))}
              </div>
            </Card>
          </div>

          {/* Context info */}
          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{formatDateLabel(selectedDate)}</p>
            <p className="mt-0.5">{formatHourLabel(selectedHour)} · toca un carril en la piscina y edita ese espacio desde el panel lateral.</p>
          </div>

          {/* Action buttons */}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <Button type="button" onClick={() => void persistBoard()} className="h-12 gap-2" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? "Guardando..." : "Guardar bloque horario"}
            </Button>
            <Button type="button" variant="secondary" onClick={resetHour} className="h-12 gap-2">
              <TimerReset size={18} />
              Restaurar cambios
            </Button>
          </div>

          {/* Status message */}
          {message ? (
            <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}
        </Card>

        {/* Pool Layout - takes full width below header */}
        <div className="grid gap-4">
          <Card className="p-4 md:p-6 lg:p-8">
            <PoolLayout
              pool={board.pool}
              lanes={draftLanes}
              selectedLaneId={selectedLaneId ?? undefined}
              onSelectLane={setSelectedLaneId}
              caption="Piscina en planta"
              rightLabel={formatHourLabel(selectedHour)}
            />
          </Card>
        </div>
      </section>

      {/* Pop-up Lane Editor Modal */}
      {selectedLane && selectedLaneStyle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className={cn(
            "relative w-full max-w-lg grid content-start gap-5 shadow-[0_30px_60px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200",
            "border-2 bg-gradient-to-br", selectedLaneStyle.panel
          )}>
            <button
              onClick={() => setSelectedLaneId(null)}
              className="absolute right-4 top-4 rounded-full p-2.5 text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Lane header */}
            <div className="flex items-start justify-between gap-3 pr-10">
              <div>
                <p className="text-sm font-semibold text-slate-600">Editando carril</p>
                <h3 className="mt-1 text-4xl font-black text-ink">#{selectedLane.laneNumber}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedLane.laneLabel}</p>
              </div>
              <Badge className={cn(selectedLaneStyle.badge, "transition-all duration-200")}>
                {OCCUPANCY_LABELS[selectedLane.category]}
              </Badge>
            </div>

            {/* Form fields */}
            <div className="grid gap-4">
              <Field label="Tipo de uso">
                <Select
                  value={selectedLane.category}
                  onChange={(event) =>
                    updateLane(selectedLaneIndex, {
                      category: event.target.value as typeof selectedLane.category,
                      organizationId: event.target.value === "libre" ? null : selectedLane.organizationId
                    })
                  }
                >
                  {Object.entries(OCCUPANCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Organización" hint={selectedLane.category === "libre" ? "No aplica para libre" : "Para academia o selección"}>
                <Select
                  value={selectedLane.organizationId ?? ""}
                  onChange={(event) => updateLane(selectedLaneIndex, { organizationId: event.target.value || null })}
                  disabled={selectedLane.category === "libre"}
                >
                  <option value="">Selecciona una organización...</option>
                  {organizationOptions.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Nadadores en el agua">
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    value={selectedLane.swimmerCount}
                    className="text-lg font-bold"
                    onChange={(event) => updateLane(selectedLaneIndex, { swimmerCount: Number(event.target.value || 0) })}
                  />
                </Field>
                <div className="flex flex-col justify-end pb-1 border-b border-transparent">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Resumen</p>
                  <p className="text-sm font-bold text-ink truncate">
                     {selectedLane.organizationName ?? (selectedLane.category === "libre" ? "Libre" : "Sin asignar")}
                  </p>
                </div>
              </div>

              <Field label="Notas operativas">
                <Textarea
                  value={selectedLane.notes}
                  placeholder="Indicaciones, nivel, materiales, observaciones..."
                  onChange={(event) => updateLane(selectedLaneIndex, { notes: event.target.value })}
                  className="resize-none"
                  rows={2}
                />
              </Field>
            </div>

            <Button onClick={() => setSelectedLaneId(null)} className="w-full mt-2 h-12 text-base shadow-md">
              Aceptar y Cerrar Editor
            </Button>
          </Card>
        </div>
      ) : null}
    </>
  );
}
