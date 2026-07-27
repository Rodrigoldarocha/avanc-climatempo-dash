import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

/**
 * Derives API status from existing weather queries in the cache,
 * avoiding direct pings that may fail due to CORS.
 * Starts optimistically as online — only shows offline after confirmed errors.
 */
export function useApiStatus() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState({ isOnline: true, isLoading: true });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queries = queryClient.getQueryCache().getAll();
      const weatherQueries = queries.filter(
        (q) =>
          q.queryKey[0] === "currentWeather" ||
          q.queryKey[0] === "hourlyForecast" ||
          q.queryKey[0] === "dailyForecast"
      );

      let next: { isOnline: boolean; isLoading: boolean };
      if (weatherQueries.length === 0) {
        next = { isOnline: true, isLoading: true };
      } else {
        const hasSuccess = weatherQueries.some((q) => q.state.status === "success");
        const hasError = weatherQueries.some((q) => q.state.status === "error");
        next = { isOnline: hasSuccess || !hasError, isLoading: false };
      }
      setStatus((prev) =>
        prev.isOnline === next.isOnline && prev.isLoading === next.isLoading
          ? prev
          : next
      );
    });

    return () => unsubscribe();
  }, [queryClient]);

  return status;
}
