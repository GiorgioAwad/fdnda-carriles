"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LiveRefreshProps {
  table?: string;
  intervalMs?: number;
}

export function LiveRefresh(props: LiveRefreshProps) {
  const router = useRouter();
  const intervalMs = props.intervalMs ?? 30000;

  useEffect(() => {
    const refreshInterval = Math.max(4000, Math.min(intervalMs, 8000));
    const interval = window.setInterval(() => {
      router.refresh();
    }, refreshInterval);

    return () => {
      window.clearInterval(interval);
    };
  }, [intervalMs, router]);

  return null;
}
