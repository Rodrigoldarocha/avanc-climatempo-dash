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

type ProxyEndpoint = "current" | "hours72" | "days15" | "history";

class ClimatempoHttpClient {
  private static async makeRequest(
    endpoint: ProxyEndpoint,
    locationCode: number,
    params?: Record<string, string>
  ): Promise<any> {
    const code = Number(locationCode);
    if (!Number.isInteger(code) || code <= 0 || code > 9_999_999) {
      throw new ApiConfigError("Código de localidade inválido");
    }

    const { data, error } = await supabase.functions.invoke("climatempo-proxy", {
      body: { endpoint, locationCode: code, fromDate: params?.fromDate },
    });

    if (error) {
      throw new ApiNetworkError("Serviço temporariamente indisponível");
    }

    if (data && typeof data === "object" && "error" in data) {
      const kind = (data as any).error;
      const message = (data as any).message ?? "Falha ao consultar a API de clima";
      if (kind === "network") throw new ApiNetworkError(message);
      if (kind === "upstream") throw new ApiUpstreamError(message);
      throw new ApiConfigError(message);
    }

    return data;
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