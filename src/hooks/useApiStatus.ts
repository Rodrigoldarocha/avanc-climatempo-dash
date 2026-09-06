import { useCallback, useEffect, useRef, useState } from "react";
import {
  get72HourForecast,
  getCurrentWeather,
  describeApiError,
  type ApiEndpoint,
} from "@/services/climatempo";

// Localidade validada no contrato da API e também presente na lista monitorada.
const HEALTH_CHECK_LOCATION_CODE = 3427;
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export interface EndpointHealth {
  endpoint: ApiEndpoint;
  label: string;
  isOnline: boolean;
  detail?: string;
}

export interface ApiHealth {
  isOnline: boolean;
  isLoading: boolean;
  isChecking: boolean;
  lastCheckedAt: Date | null;
  endpoints: EndpointHealth[];
  recheck: () => void;
}

/**
 * Health check real do backend: consulta clima atual e previsão 72h para uma
 * localidade estável e reporta o status de cada endpoint separadamente.
 */
export function useApiHealth(): ApiHealth {
  const [state, setState] = useState<{
    isLoading: boolean;
    isChecking: boolean;
    lastCheckedAt: Date | null;
    endpoints: EndpointHealth[];
  }>({
    isLoading: true,
    isChecking: true,
    lastCheckedAt: null,
    endpoints: [
      { endpoint: "current", label: "Clima atual", isOnline: false },
      { endpoint: "hours72", label: "Previsão 72h", isOnline: false },
    ],
  });

  const activeRef = useRef(true);

  const runCheck = useCallback(async () => {
    setState((prev) => ({ ...prev, isChecking: true }));

    const probes: Array<{ endpoint: ApiEndpoint; label: string; run: () => Promise<unknown> }> = [
      {
        endpoint: "current",
        label: "Clima atual",
        run: () => getCurrentWeather(HEALTH_CHECK_LOCATION_CODE),
      },
      {
        endpoint: "hours72",
        label: "Previsão 72h",
        run: () => get72HourForecast(HEALTH_CHECK_LOCATION_CODE),
      },
    ];

    const results = await Promise.all(
      probes.map(async ({ endpoint, label, run }): Promise<EndpointHealth> => {
        try {
          await run();
          return { endpoint, label, isOnline: true };
        } catch (error) {
          const described = describeApiError(error, endpoint);
          return { endpoint, label, isOnline: false, detail: described.detail };
        }
      })
    );

    if (!activeRef.current) return;
    setState({
      isLoading: false,
      isChecking: false,
      lastCheckedAt: new Date(),
      endpoints: results,
    });
  }, []);

  useEffect(() => {
    activeRef.current = true;
    void runCheck();
    const interval = window.setInterval(() => void runCheck(), CHECK_INTERVAL_MS);

    return () => {
      activeRef.current = false;
      window.clearInterval(interval);
    };
  }, [runCheck]);

  return {
    ...state,
    isOnline: state.endpoints.some((e) => e.isOnline),
    recheck: () => void runCheck(),
  };
}

/** Compatibilidade com os consumidores existentes. */
export function useApiStatus() {
  const health = useApiHealth();
  return { isOnline: health.isOnline, isLoading: health.isLoading, ...health };
}
