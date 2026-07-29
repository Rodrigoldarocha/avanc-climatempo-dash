import { useQuery } from "@tanstack/react-query";
import { locations } from "@/data/locations";
import { get15DayForecast, get72HourForecast } from "@/services/climatempo";
import { buildAlertsForLocation, runWithConcurrency, RAIN_MM_H_THRESHOLD, RAIN_PROB_THRESHOLD } from "@/lib/alerts";

/**
 * Fetches and caches the 7-day alerts globally so the badge count and the
 * Alerts page load automatically as soon as the app mounts, and auto-refresh
 * every 10 minutes even when the user is on another tab.
 */
export function useAlertCount() {
  const { data } = useQuery<any[]>({
    queryKey: ["alerts", "7d", RAIN_MM_H_THRESHOLD, RAIN_PROB_THRESHOLD],
    queryFn: async () => {
      const sampleLocations = locations.slice(0, 15);
      const perLocation = await runWithConcurrency(sampleLocations, 6, buildAlertsForLocation);
      return perLocation.flat();
    },
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    initialData: [],
  });

  const alerts = data ?? [];
  const highCount = alerts.filter((a: any) => a.severity === "high").length;
  const totalCount = alerts.length;

  return { highCount, totalCount };
}
