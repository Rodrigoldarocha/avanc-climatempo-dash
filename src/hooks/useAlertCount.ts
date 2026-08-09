import { useAlerts } from "@/hooks/useAlerts";

/**
 * Badge counts derived from the shared alerts query, so the number shown in the
 * header/nav always matches the Alerts page.
 */
export function useAlertCount() {
  const { data, isLoading } = useAlerts();
  const alerts = data ?? [];

  return {
    highCount: alerts.filter((a) => a.severity === "high").length,
    totalCount: alerts.length,
    isLoading,
  };
}
