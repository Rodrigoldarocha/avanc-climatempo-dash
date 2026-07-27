import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

/**
 * Reads the cached alert count from the alerts query.
 * Does NOT trigger its own fetch — relies on AlertsPanel populating the cache.
 */
export function useAlertCount() {
  const queryClient = useQueryClient();
  const [counts, setCounts] = useState({ highCount: 0, totalCount: 0 });

  useEffect(() => {
    const updateCounts = () => {
      const data = queryClient.getQueryData<any[]>(["alerts", "7d", 20, 70]);
      const alerts = data ?? [];
      const highCount = alerts.filter((a: any) => a.severity === "high").length;
      const totalCount = alerts.length;
      setCounts({ highCount, totalCount });
    };

    // Initial read
    updateCounts();

    // Subscribe to cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      updateCounts();
    });

    return () => unsubscribe();
  }, [queryClient]);

  return counts;
}
