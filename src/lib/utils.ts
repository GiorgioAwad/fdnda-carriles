import { clsx, type ClassValue } from "clsx";
import type { OccupancyCategory } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(`${value}T00:00:00`));
}

export function formatHourLabel(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(`2026-03-20T${value}:00`));
}

export function isoNow() {
  return new Date().toISOString();
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function categoryOrder(category: OccupancyCategory) {
  return ["academia", "club", "seleccionados", "libre"].indexOf(category);
}

export function uniqueBy<T>(items: T[], selector: (item: T) => string) {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(selector(item), item);
  }
  return Array.from(map.values());
}

export function buildHourRange(startHour: string, endHour: string) {
  const start = Number.parseInt(startHour.split(":")[0] ?? "0", 10);
  const end = Number.parseInt(endHour.split(":")[0] ?? "0", 10);
  return Array.from({ length: Math.max(end - start, 1) }, (_, index) => {
    const hour = String(start + index).padStart(2, "0");
    return `${hour}:00`;
  });
}
