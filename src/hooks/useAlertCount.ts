import { useQuery } from "@tanstack/react-query";

/**
 * Reads the cached alert count from the alerts query.
 * Does NOT trigger its own fetch — relies on AlertsPanel populating the cache.
 */
export function useAlertCount() {
  const { data } = useQuery<any[]>({
    queryKey: ["alerts", "7d", 20, 70],
    queryFn: () => Promise.resolve([]),
    enabled: false,
    initialData: [],
  });

  const alerts = data ?? [];
  const highCount = alerts.filter((a: any) => a.severity === "high").length;
  const totalCount = alerts.length;

  return { highCount, totalCount };
}
