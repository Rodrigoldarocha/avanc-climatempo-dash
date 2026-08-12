import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather } from "@/services/climatempo";

// Localidade validada no contrato da API e também presente na lista monitorada.
const HEALTH_CHECK_LOCATION_CODE = 3427;

/**
 * Uses a real weather request as the API health check. Individual locations may
 * be unavailable in the provider plan, which must not incorrectly mark the
 * entire API as offline.
 */
export function useApiStatus() {
  const { isSuccess, isPending, isFetching } = useQuery({
    queryKey: ["currentWeather", HEALTH_CHECK_LOCATION_CODE],
    queryFn: () => getCurrentWeather(HEALTH_CHECK_LOCATION_CODE),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    isOnline: isSuccess,
    isLoading: isPending || (isFetching && !isSuccess),
  };
}
