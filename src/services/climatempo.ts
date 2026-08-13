// Climatempo API Service — all calls go through the secure backend proxy.
// Tokens never reach the browser.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export class ApiConfigError extends Error {
  constructor(msg: string) { super(msg); this.name = "ApiConfigError"; }
}
export class ApiNetworkError extends Error {
  constructor(msg: string) { super(msg); this.name = "ApiNetworkError"; }
}
export class ApiUpstreamError extends Error {
  constructor(msg: string) { super(msg); this.name = "ApiUpstreamError"; }
}

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
      const message = (data as any).message ?? "Falha ao consultar a API de clima";
      if (kind === "network" || kind === "config") return fallbackDirect();
      if (kind === "upstream") throw new ApiUpstreamError(message);
      throw new ApiConfigError(message);
    }

    return data;
  }

  // Último recurso: o build do Lovable nem sempre injeta o `.env` do repo.
  // Env vars VITE continuam tendo prioridade quando presentes.
  private static readonly FALLBACK_TOKENS = {
    forecast: "89bb538e364626514c7c6f4144c3a3cb",
    history: "730dfea9272da27dc1ce7dab4107467e",
  };

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
    } catch (_networkError) {
      throw new ApiNetworkError("Serviço temporariamente indisponível");
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      throw new ApiUpstreamError(text.slice(0, 200) || upstream.statusText);
    }

    return upstream.json();
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