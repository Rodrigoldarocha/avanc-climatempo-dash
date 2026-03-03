import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

/**
 * Derives API status from existing weather queries in the cache,
 * avoiding direct pings that may fail due to CORS.
 */
export function useApiStatus() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState({ isOnline: false, isLoading: true });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queries = queryClient.getQueryCache().getAll();
      const weatherQueries = queries.filter(
        (q) =>
          q.queryKey[0] === "currentWeather" ||
          q.queryKey[0] === "hourlyForecast" ||
          q.queryKey[0] === "dailyForecast"
      );

      if (weatherQueries.length === 0) {
        setStatus({ isOnline: false, isLoading: true });
        return;
      }

      const hasSuccess = weatherQueries.some((q) => q.state.status === "success");
      const allSettled = weatherQueries.every(
        (q) => q.state.status === "success" || q.state.status === "error"
      );

      setStatus({ isOnline: hasSuccess, isLoading: !allSettled });
    });

    return () => unsubscribe();
  }, [queryClient]);

  return status;
}
