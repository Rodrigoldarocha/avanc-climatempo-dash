import { useEffect, useState } from "react";
import { getCurrentWeather } from "@/services/climatempo";

// Localidade validada no contrato da API e também presente na lista monitorada.
const HEALTH_CHECK_LOCATION_CODE = 3427;

/**
 * Uses a real weather request as the API health check. Individual locations may
 * be unavailable in the provider plan, which must not incorrectly mark the
 * entire API as offline.
 */
export function useApiStatus() {
  const [status, setStatus] = useState({ isOnline: false, isLoading: true });

  useEffect(() => {
    let active = true;

    const checkApi = async () => {
      try {
        await getCurrentWeather(HEALTH_CHECK_LOCATION_CODE);
        if (active) setStatus({ isOnline: true, isLoading: false });
      } catch {
        if (active) setStatus({ isOnline: false, isLoading: false });
      }
    };

    void checkApi();
    const interval = window.setInterval(checkApi, 5 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return status;
}
