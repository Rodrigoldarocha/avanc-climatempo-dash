// Climatempo API Service — all calls go through the secure backend proxy.
// Tokens never reach the browser.
import { supabase } from "@/integrations/supabase/client";

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

class ClimatempoHttpClient {
  private static BASE_URL = "https://apiadvisor.climatempo.com.br/api/v1";
  private static readonly VALID_ENDPOINTS = new Set(["current", "hours72", "days15", "history"]);
  private static readonly DEFAULT_FORECAST_TOKEN = "89bb538e364626514c7c6f4144c3a3cb";
  private static readonly DEFAULT_HISTORY_TOKEN = "730dfea9272da27dc1ce7dab4107467e";

  private static sanitizeToken(value: string | undefined): string | undefined {
    return value?.trim().replace(/^['"]|['"]$/g, "");
  }

  private static getEnvValue(name: string): string | undefined {
    const envMeta = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
    const rawValue = envMeta?.[`VITE_${name}`] ??
      (typeof process !== "undefined" ? (process as any).env?.[`VITE_${name}`] : undefined) ??
      (typeof process !== "undefined" ? (process as any).env?.[name] : undefined);
    return typeof rawValue === "string" ? rawValue : undefined;
  }

  private static getTokens() {
    const forecastToken = this.sanitizeToken(this.getEnvValue("CLIMATEMPO_FORECAST_TOKEN")) ?? this.DEFAULT_FORECAST_TOKEN;
    const historyToken = this.sanitizeToken(this.getEnvValue("CLIMATEMPO_HISTORY_TOKEN")) ?? this.DEFAULT_HISTORY_TOKEN;
    return { forecastToken, historyToken };
  }

  private static async makeRequest(
    endpoint: string,
    locationCode: number,
    params?: Record<string, string>
  ): Promise<any> {
    if (!this.VALID_ENDPOINTS.has(endpoint)) {
      throw new ApiConfigError("Invalid endpoint");
    }

    const code = Number(locationCode);
    if (!Number.isInteger(code) || code <= 0 || code > 9_999_999) {
      throw new ApiConfigError("Invalid locationCode");
    }

    const safeFromDate = typeof params?.fromDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.fromDate)
      ? params.fromDate
      : "2024-01-01";

    const { forecastToken, historyToken } = this.getTokens();

    let url: string;
    switch (endpoint) {
      case "current":
        url = `${this.BASE_URL}/weather/locale/${code}/current?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "hours72":
        url = `${this.BASE_URL}/forecast/locale/${code}/hours/72?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "days15":
        url = `${this.BASE_URL}/forecast/locale/${code}/days/15?token=${encodeURIComponent(forecastToken)}`;
        break;
      case "history":
        url = `${this.BASE_URL}/history/locale/${code}?token=${encodeURIComponent(historyToken)}&from=${safeFromDate}`;
        break;
      default:
        throw new ApiConfigError("Invalid endpoint");
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch (networkError) {
      throw new ApiNetworkError("Serviço temporariamente indisponível");
    }

    if (!response.ok) {
      const responseText = await response.text();
      const message = `API Climatempo error ${response.status}: ${responseText || response.statusText}`;
      throw new ApiUpstreamError(message);
    }

    return await response.json();
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