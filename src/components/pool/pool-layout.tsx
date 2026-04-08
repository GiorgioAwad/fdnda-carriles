"use client";

import { UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OCCUPANCY_LABELS, OCCUPANCY_STYLES, POOL_TYPE_LABELS } from "@/lib/constants";
import { cn, formatShortDateRange } from "@/lib/utils";
import type { Pool, PoolBoard } from "@/lib/types";

type PoolLane = PoolBoard["lanes"][number];

interface PoolLayoutProps {
  pool: Pool;
  lanes: PoolLane[];
  selectedLaneId?: string;
  onSelectLane?: (laneId: string) => void;
  compact?: boolean;
  className?: string;
  caption?: string;
  rightLabel?: string;
  showLegend?: boolean;
}

const WATER_TINTS = {
  academia: "bg-cyan-500/40",
  club: "bg-blue-600/50",
  seleccionados: "bg-amber-500/50",
  libre: "bg-emerald-500/40"
} as const;

export function PoolLayout({
  pool,
  lanes,
  selectedLaneId,
  onSelectLane,
  compact = false,
  className,
  caption,
  rightLabel,
  showLegend = true
}: PoolLayoutProps) {
  const poolWidth = pool.type === "50m" ? "100%" : "74%";

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-1">
        <div>
          {caption ? <p className="text-sm font-bold uppercase tracking-wider text-surf">{caption}</p> : null}
          <h3 className={cn("font-extrabold tracking-tight text-ink", compact ? "text-xl" : "text-2xl md:text-3xl")}>{pool.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{POOL_TYPE_LABELS[pool.type]} · {pool.laneCount} carriles</p>
        </div>
        {rightLabel ? <Badge className="bg-ink text-white ring-ink/10">{rightLabel}</Badge> : null}
      </div>

      {showLegend ? (
        <div className="flex flex-wrap gap-2 px-1">
          {Object.entries(OCCUPANCY_LABELS).map(([category, label]) => (
            <Badge key={category} className={cn(OCCUPANCY_STYLES[category as keyof typeof OCCUPANCY_STYLES].badge, "transition-transform hover:scale-105")}>
              {label}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Pool Deck / Exterior */}
      <div className="rounded-xl border border-slate-300/80 bg-slate-200 p-2 shadow-inner md:p-4">
        {/* Pool Water Container */}
        <div 
          className="relative mx-auto flex flex-col overflow-hidden rounded-md border-[6px] border-slate-300 bg-[linear-gradient(135deg,#0284c7_0%,#0369a1_100%)] shadow-inner transition-all" 
          style={{ width: poolWidth }}
        >
          {/* Water styling layers */}
          <div className="absolute inset-0 bg-pool-grid opacity-15" />
          <div className="animate-water-shimmer pointer-events-none absolute inset-0 z-0" />

          {/* Lanes */}
          <div className="relative z-10 flex flex-col">
            {lanes.map((lane, index) => {
              const interactive = Boolean(onSelectLane);
              const selected = lane.laneId === selectedLaneId;
              const emptyLane = lane.swimmerCount === 0 && !lane.organizationId && !lane.notes.trim();

              const content = (
                <div className={cn(
                  "group relative flex w-full items-stretch transition-all",
                  compact ? "h-10 md:h-12" : "h-14 md:h-16",
                  interactive ? "cursor-pointer" : ""
                )}>
                  {/* Top Corchera (Lane Rope) - rendered for the first lane only to complete the grid */}
                  {index === 0 ? (
                    <div className="absolute inset-x-0 top-0 z-20 h-1.5 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#ef4444_0px,#ef4444_20px,#ffffff_20px,#ffffff_40px)] shadow-sm opacity-90" />
                  ) : null}

                  {/* Water Tint Layer */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    !emptyLane && WATER_TINTS[lane.category],
                    emptyLane ? "opacity-0" : "opacity-100",
                    interactive && !selected ? "group-hover:bg-white/20" : "",
                    selected ? "bg-white/30 backdrop-blur-[1px]" : ""
                  )} />

                  {/* Selected Indicator border */}
                  {selected ? (
                    <div className="absolute inset-0 z-10 border-[3px] border-white/80 shadow-[inset_0_0_12px_rgba(255,255,255,0.5)] pointer-events-none" />
                  ) : null}

                  {/* Left Edge: Starting Block */}
                  <div className={cn(
                    "relative z-20 flex w-10 shrink-0 select-none items-center justify-center border-r-2 border-slate-400 bg-slate-100 font-bold text-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.15)] md:w-14",
                    compact ? "text-sm" : "text-base"
                  )}>
                    {lane.laneNumber}
                  </div>

                  {/* Lane Water Content */}
                  <div className="relative z-10 flex flex-1 items-center justify-between px-3 md:px-5">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-semibold text-white drop-shadow-md lg:text-sm">
                        {lane.organizationName ?? (emptyLane ? "" : OCCUPANCY_LABELS[lane.category])}
                      </span>
                      {lane.startDate && lane.endDate && lane.startDate !== lane.endDate ? (
                        <span className="truncate text-[10px] font-medium text-white/80 drop-shadow-md">
                          {formatShortDateRange(lane.startDate, lane.endDate)}
                        </span>
                      ) : null}
                    </div>

                    {lane.swimmerCount > 0 ? (
                      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink/50 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm md:px-2.5 md:py-1 md:text-xs">
                        <UsersRound size={compact ? 12 : 14} />
                        {lane.swimmerCount}
                      </div>
                    ) : null}
                  </div>

                  {/* Right Edge: Touch panel (yellow) */}
                  <div className="relative z-20 w-2 shrink-0 border-l border-yellow-600/50 bg-yellow-500/80 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]" />

                  {/* Bottom Corchera (Lane Rope) */}
                  <div className="absolute bottom-0 inset-x-0 z-20 h-1.5 translate-y-1/2 bg-[repeating-linear-gradient(90deg,#ef4444_0px,#ef4444_20px,#ffffff_20px,#ffffff_40px)] shadow-sm opacity-90" />
                </div>
              );

              if (!interactive) {
                return (
                  <div key={lane.laneId} className="relative z-10">
                    {content}
                  </div>
                );
              }

              return (
                <button 
                  key={lane.laneId} 
                  type="button" 
                  onClick={() => onSelectLane?.(lane.laneId)} 
                  className="relative z-10 w-full focus:outline-none"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
