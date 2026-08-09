import { useQuery } from "@tanstack/react-query";
import { locations } from "@/data/locations";
import {
  buildAlertsForLocation,
  runWithConcurrency,
  RAIN_MM_H_THRESHOLD,
  RAIN_PROB_THRESHOLD,
  type WeatherAlert,
} from "@/lib/alerts";

export const ALERTS_QUERY_KEY = ["alerts", "7d", RAIN_MM_H_THRESHOLD, RAIN_PROB_THRESHOLD] as const;

/**
 * Single source of truth for the 7-day alerts: the header badge and the
 * Alerts page share this query, so counts can never diverge.
 */
export function useAlerts() {
  return useQuery<WeatherAlert[]>({
    queryKey: ALERTS_QUERY_KEY,
    queryFn: async () => {
      const perLocation = await runWithConcurrency(locations, 6, buildAlertsForLocation);
      return perLocation.flat();
    },
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
}