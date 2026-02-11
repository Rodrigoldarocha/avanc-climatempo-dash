import { useQuery } from "@tanstack/react-query";

const FORECAST_TOKEN = "89bb538e364626514c7c6f4144c3a3cb";
const PING_URL = `https://apiadvisor.climatempo.com.br/api/v1/weather/locale/3477/current?token=${FORECAST_TOKEN}`;

export function useApiStatus() {
  const { data: isOnline, isLoading } = useQuery({
    queryKey: ["api-status-ping"],
    queryFn: async () => {
      try {
        const res = await fetch(PING_URL, { signal: AbortSignal.timeout(8000) });
        return res.ok;
      } catch {
        return false;
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });

  return { isOnline: isOnline ?? false, isLoading };
}
