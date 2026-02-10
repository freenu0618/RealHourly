import { useEffect, useState } from "react";
import type { DashboardData } from "./types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json.data);
      } catch {
        console.error("[Dashboard] Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading };
}
