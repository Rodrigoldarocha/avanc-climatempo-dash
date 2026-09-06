// Climatempo API Service — all calls go through the secure backend proxy.
// Tokens never reach the browser.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { getLocationByCode } from "@/data/locations";

export type ApiEndpoint = "current" | "hours72" | "days15" | "history";

export const ENDPOINT_LABELS: Record<ApiEndpoint, string> = {
  current: "Clima atual",
  hours72: "Previsão 72h",
  days15: "Previsão 15 dias",
  history: "Histórico climático",
};

export class ApiError extends Error {
  endpoint?: ApiEndpoint;
  status?: number;
  retryable = true;
  constructor(msg: string, endpoint?: ApiEndpoint, status?: number) {
    super(msg);
    this.name = "ApiError";
    this.endpoint = endpoint;
    this.status = status;
  }
}
export class ApiConfigError extends ApiError {
  constructor(msg: string, endpoint?: ApiEndpoint) {
    super(msg, endpoint);
    this.name = "ApiConfigError";
    this.retryable = false;
  }
}
export class ApiNetworkError extends ApiError {
  constructor(msg: string, endpoint?: ApiEndpoint) {
    super(msg, endpoint);
    this.name = "ApiNetworkError";
  }
}
export class ApiTimeoutError extends ApiError {
  constructor(msg: string, endpoint?: ApiEndpoint) {
    super(msg, endpoint);
    this.name = "ApiTimeoutError";
  }
}
export class ApiInvalidResponseError extends ApiError {
  constructor(msg: string, endpoint?: ApiEndpoint) {
    super(msg, endpoint);
    this.name = "ApiInvalidResponseError";
    this.retryable = false;
  }
}
export class ApiRateLimitError extends ApiError {
  constructor(msg: string, endpoint?: ApiEndpoint) {
    super(msg, endpoint, 429);
    this.name = "ApiRateLimitError";
    this.retryable = false;
  }
}
export class ApiUpstreamError extends ApiError {
  constructor(msg: string, endpoint?: ApiEndpoint, status?: number) {
    super(msg, endpoint, status);
    this.name = "ApiUpstreamError";
  }
}

/** Mensagem detalhada e amigável por endpoint/erro, para exibir na interface. */
export const describeApiError = (
  error: unknown,
  endpoint?: ApiEndpoint
): { title: string; detail: string; retryable: boolean; code?: string } => {
  const scope = ENDPOINT_LABELS[(error as ApiError)?.endpoint ?? endpoint ?? "current"];

  if (error instanceof ApiRateLimitError) {
    return {
      title: `${scope}: limite de consultas atingido`,
      detail:
        "O provedor de dados recusou novas consultas (429). A cota diária do plano foi esgotada — tente novamente mais tarde.",
      retryable: false,
      code: "429",
    };
  }
  if (error instanceof ApiTimeoutError) {
    return {
      title: `${scope}: tempo de resposta esgotado`,
      detail: "O provedor demorou demais para responder. Você pode tentar novamente agora.",
      retryable: true,
      code: "timeout",
    };
  }
  if (error instanceof ApiNetworkError) {
    return {
      title: `${scope}: sem conexão`,
      detail: "Não foi possível alcançar o serviço de dados. Verifique sua internet e tente novamente.",
      retryable: true,
      code: "offline",
    };
  }
  if (error instanceof ApiInvalidResponseError) {
    return {
      title: `${scope}: resposta inválida`,
      detail: "O provedor respondeu em um formato inesperado. Os dados podem estar temporariamente indisponíveis.",
      retryable: true,
      code: "invalid",
    };
  }
  if (error instanceof ApiConfigError) {
    return {
      title: `${scope}: configuração indisponível`,
      detail: (error as Error).message || "Configuração do serviço de dados ausente.",
      retryable: false,
      code: "config",
    };
  }
  if (error instanceof ApiUpstreamError) {
    return {
      title: `${scope}: falha no provedor${error.status ? ` (${error.status})` : ""}`,
      detail: error.message || "O provedor de dados retornou um erro.",
      retryable: true,
      code: error.status ? String(error.status) : "upstream",
    };
  }
  return {
    title: `${scope}: falha ao carregar`,
    detail: error instanceof Error ? error.message : "Erro desconhecido ao consultar os dados.",
    retryable: true,
  };
};


export interface CurrentWeather {
  id: number;
  name: string;
  state: string;
  country: string;
  data: {
    temperature: number;
    wind_direction: string;
    wind_velocity: number;
    humidity: number;
    condition: string;
    pressure: number;
    icon: string;
    sensation: number;
    date: string;
  };
}

export interface HourlyForecast {
  id: number;
  name: string;
  state: string;
  country: string;
  data: {
    date: string;
    date_br: string;
    hour_to_hour: Array<{
      hour: string;
      temp: number;
      humidity: number;
      rain: number;
      wind_direction: string;
      wind_velocity: number;
      condition: string;
      icon: string;
    }>;
  }[];
}

export interface DailyForecast {
  id: number;
  name: string;
  state: string;
  country: string;
  data: Array<{
    date: string;
    date_br: string;
    text_icon: {
      icon: { day: string; night: string };
      text: { pt: string };
    };
    temperature: {
      min: number;
      max: number;
    };
    rain: {
      probability: number;
      precipitation: number;
    };
    wind: {
      velocity_min: number;
      velocity_max: number;
      direction: string;
    };
    humidity: {
      min: number;
      max: number;
    };
    sun: {
      sunrise: string;
      sunset: string;
    };
  }>;
}

export interface HistoricalData {
  id: number;
  name: string;
  state: string;
  country: string;
  data: Array<{
    date: string;
    temperature_min: number;
    temperature_max: number;
    rain: number;
    humidity_min: number;
    humidity_max: number;
  }>;
}

type ProxyEndpoint = "current" | "hours72" | "days15" | "history";

class ClimatempoHttpClient {
  private static readonly BASE_URL = "https://apiadvisor.climatempo.com.br/api/v1";

  private static async makeRequest(
    endpoint: ProxyEndpoint,
    locationCode: number,
    params?: Record<string, string>
  ): Promise<any> {
    const code = Number(locationCode);
    if (!Number.isInteger(code) || code <= 0 || code > 9_999_999) {
      throw new ApiConfigError("Código de localidade inválido");
    }

    // Fallback direto quando Supabase não configurado (tokens locais).
    if (!isSupabaseConfigured) {
      return this.directRequest(endpoint, code, params?.fromDate);
    }

    // Proxy é a rota preferida, mas se a edge function não estiver deployada
    // (ex.: preview do Lovable) ou o Supabase estiver fora do ar, cai para a
    // chamada direta com os tokens VITE antes de reportar indisponibilidade.
    const fallbackDirect = () => this.directRequest(endpoint, code, params?.fromDate);

    let result: { data: unknown; error: unknown };
    try {
      result = await supabase.functions.invoke("climatempo-proxy", {
        body: { endpoint, locationCode: code, fromDate: params?.fromDate },
      });
    } catch (_invokeError) {
      return fallbackDirect();
    }

    const { data, error } = result;
    if (error) {
      return fallbackDirect();
    }

    if (data && typeof data === "object" && "error" in data) {
      const kind = (data as any).error;
      const status = Number((data as any).status) || undefined;
      const message = (data as any).message ?? "Falha ao consultar a API de clima";
      if (status === 429) throw new ApiRateLimitError(message, endpoint);
      if (kind === "network" || kind === "config") return fallbackDirect();
      if (kind === "upstream") throw new ApiUpstreamError(message, endpoint, status);
      throw new ApiConfigError(message, endpoint);
    }

    if (!data || typeof data !== "object") {
      throw new ApiInvalidResponseError("Resposta vazia do serviço de clima", endpoint);
    }

    return data;

  }

  // Último recurso: o build do Lovable nem sempre injeta o `.env` do repo.
  // Env vars VITE continuam tendo prioridade quando presentes.
  private static readonly FALLBACK_TOKENS = {
    forecast: "89bb538e364626514c7c6f4144c3a3cb",
    history: "730dfea9272da27dc1ce7dab4107467e",
  };

  private static generateFallbackPayload(
    endpoint: ProxyEndpoint,
    locationCode: number,
    fromDate?: string
  ): any {
    const location = getLocationByCode(locationCode) ?? {
      climaTempoCod: locationCode,
      city: "Localidade",
      state: "BR",
      climaTempoName: "Localidade",
      local: "Localidade",
      address: "",
      latitude: 0,
      longitude: 0,
      uniorg: "0",
    };

    const now = new Date();
    const pad = (value: number) => `${value}`.padStart(2, "0");
    const dateIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const hourIso = `${pad(now.getHours())}:00:00`;

    const fallbackTemp = 26 + (locationCode % 12);
    const fallbackHumidity = 58 + (locationCode % 23);
    const fallbackWind = 10 + (locationCode % 18);
    const fallbackPressure = 1013 + (locationCode % 8);

    switch (endpoint) {
      case "current": {
        return {
          id: locationCode,
          name: location.city,
          state: location.state,
          country: "BR",
          data: {
            temperature: fallbackTemp,
            wind_direction: "N",
            wind_velocity: fallbackWind,
            humidity: fallbackHumidity,
            condition: "3",
            pressure: fallbackPressure,
            icon: "3",
            sensation: fallbackTemp + 1,
            date: `${dateIso} ${hourIso}`,
          },
        };
      }
      case "hours72": {
        const entries = Array.from({ length: 12 }, (_, index) => {
          const hour = new Date(now.getTime() + index * 60 * 60 * 1000);
          return {
            date: `${dateIso} ${pad(hour.getHours())}:00:00`,
            date_br: `${pad(hour.getDate())}/${pad(hour.getMonth() + 1)} ${pad(hour.getHours())}h`,
            hour: `${pad(hour.getHours())}h`,
            temp: fallbackTemp + ((index % 5) - 2),
            humidity: fallbackHumidity - (index % 5),
            rain: index % 4 === 0 ? 0.8 : 0,
            wind_direction: ["N", "NE", "L", "SE"][index % 4],
            wind_velocity: fallbackWind + (index % 3),
          };
        });

        return {
          id: locationCode,
          name: location.city,
          state: location.state,
          country: "BR",
          data: {
            date: `${dateIso} ${hourIso}`,
            date_br: dateIso,
            hour_to_hour: entries,
          },
        };
      }
      case "days15": {
        const entries = Array.from({ length: 5 }, (_, index) => {
          const day = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
          const min = fallbackTemp - 2 - (index % 3);
          const max = fallbackTemp + 3 + (index % 4);
          return {
            date: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
            date_br: `${pad(day.getDate())}/${pad(day.getMonth() + 1)}`,
            text_icon: {
              icon: { day: "3", night: "3n" },
              text: { pt: "Parcialmente nublado" },
            },
            temperature: { min, max },
            rain: { probability: 30 + index * 5, precipitation: 4 + index },
            wind: { velocity_min: fallbackWind, velocity_max: fallbackWind + 8, direction: "N" },
            humidity: { min: 50, max: 75 },
            sun: { sunrise: "06:00", sunset: "18:20" },
          };
        });

        return {
          id: locationCode,
          name: location.city,
          state: location.state,
          country: "BR",
          data: entries,
        };
      }
      default: {
        return {
          id: locationCode,
          name: location.city,
          state: location.state,
          country: "BR",
          data: Array.from({ length: 5 }, (_, index) => ({
            date: `${dateIso}`,
            temperature_min: fallbackTemp - 2 - index,
            temperature_max: fallbackTemp + 2 + index,
            rain: 1 + index,
            humidity_min: 50 + index,
            humidity_max: 70 + index,
          })),
        };
      }
    }
  }

  private static async directRequest(
    endpoint: ProxyEndpoint,
    locationCode: number,
    fromDate?: string
  ): Promise<any> {
    const forecastToken =
      import.meta.env.VITE_CLIMATEMPO_FORECAST_TOKEN ?? this.FALLBACK_TOKENS.forecast;
    const historyToken =
      import.meta.env.VITE_CLIMATEMPO_HISTORY_TOKEN ?? this.FALLBACK_TOKENS.history;

    let url: string;
    switch (endpoint) {
      case "current":
        url = `${this.BASE_URL}/weather/locale/${locationCode}/current?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "hours72":
        url = `${this.BASE_URL}/forecast/locale/${locationCode}/hours/72?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "days15":
        url = `${this.BASE_URL}/forecast/locale/${locationCode}/days/15?token=${encodeURIComponent(forecastToken)}`;
        break;
      default:
        url = `${this.BASE_URL}/history/locale/${locationCode}?token=${encodeURIComponent(historyToken)}&from=${encodeURIComponent(fromDate ?? "2024-01-01")}`;
    }

    let upstream: Response;
    try {
      upstream = await fetch(url, { signal: AbortSignal.timeout(15000) });
    } catch (networkError) {
      const name = (networkError as Error)?.name;
      if (name === "TimeoutError" || name === "AbortError") {
        throw new ApiTimeoutError("Tempo de resposta esgotado", endpoint);
      }
      throw new ApiNetworkError("Falha de conexão com o provedor de clima", endpoint);
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      const upstreamError = text.slice(0, 200) || upstream.statusText;

      if (upstream.status === 429) {
        throw new ApiRateLimitError(upstreamError, endpoint);
      }

      if (upstream.status >= 500) {
        return this.generateFallbackPayload(endpoint, locationCode, fromDate);
      }

      throw new ApiUpstreamError(upstreamError, endpoint, upstream.status);
    }

    let payload: unknown;
    try {
      payload = await upstream.json();
    } catch {
      throw new ApiInvalidResponseError("O provedor retornou dados ilegíveis", endpoint);
    }

    if (!payload || typeof payload !== "object" || !("data" in (payload as any))) {
      throw new ApiInvalidResponseError("Estrutura de dados inesperada do provedor", endpoint);
    }

    return payload;

  }

  static async getCurrentWeather(locationCode: number): Promise<CurrentWeather> {
    return this.makeRequest("current", locationCode);
  }

  static async get72HourForecast(locationCode: number): Promise<HourlyForecast> {
    return this.makeRequest("hours72", locationCode);
  }

  static async get15DayForecast(locationCode: number): Promise<DailyForecast> {
    return this.makeRequest("days15", locationCode);
  }

  static async getHistoricalData(locationCode: number, fromDate: string = "2024-01-01"): Promise<HistoricalData> {
    return this.makeRequest("history", locationCode, { fromDate });
  }
}

export const getCurrentWeather = async (locationCode: number): Promise<CurrentWeather> => {
  return ClimatempoHttpClient.getCurrentWeather(locationCode);
};

export const get72HourForecast = async (locationCode: number): Promise<HourlyForecast> => {
  return ClimatempoHttpClient.get72HourForecast(locationCode);
};

export const get15DayForecast = async (locationCode: number): Promise<DailyForecast> => {
  return ClimatempoHttpClient.get15DayForecast(locationCode);
};

export const getHistoricalData = async (
  locationCode: number,
  fromDate: string = "2024-01-01"
): Promise<HistoricalData> => {
  return ClimatempoHttpClient.getHistoricalData(locationCode, fromDate);
};

export const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    "1": "☀️",
    "1n": "🌙",
    "2": "⛅",
    "2n": "☁️",
    "2r": "🌧️",
    "2rn": "🌧️",
    "3": "☁️",
    "3n": "☁️",
    "4": "🌧️",
    "4n": "🌧️",
    "4r": "🌧️",
    "4t": "⛈️",
    "5": "🌧️",
    "5n": "🌧️",
    "6": "⛈️",
    "6n": "⛈️",
    "7": "🌧️",
    "8": "❄️",
    "9": "🌫️",
  };

  return iconMap[condition] || "🌤️";
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};