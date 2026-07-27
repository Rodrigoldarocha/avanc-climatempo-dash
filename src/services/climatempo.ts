// Climatempo API Service — via Edge Function proxy
import { supabase } from "@/integrations/supabase/client";

// Custom error types for differentiated handling
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

// Proxy helper — calls the edge function instead of the API directly
const callProxy = async (endpoint: string, locationCode: number, params?: Record<string, string>) => {
  const { data, error } = await supabase.functions.invoke("climatempo-proxy", {
    body: { endpoint, locationCode, params },
  });

  if (error) {
    throw new ApiNetworkError(`Proxy error: ${error.message}`);
  }

  // Handle fallback signal from edge function (network/service issues)
  if (data?.fallback) {
    const errMsg = data.error || "SERVICE_UNAVAILABLE";
    if (errMsg === "API_CONFIG_MISSING") {
      throw new ApiConfigError("Tokens climáticos não configurados. Contate o administrador.");
    }
    throw new ApiNetworkError("Serviço temporariamente indisponível");
  }

  if (data?.error) {
    if (data.error === "API_CONFIG_MISSING") {
      throw new ApiConfigError("Tokens climáticos não configurados.");
    }
    if (data.status && data.status >= 500) {
      throw new ApiUpstreamError(`API Climatempo indisponível (${data.status})`);
    }
    throw new ApiUpstreamError(data.error);
  }

  return data;
};

// Get current weather for a location
export const getCurrentWeather = async (locationCode: number): Promise<CurrentWeather> => {
  return callProxy("current", locationCode);
};

// Get 72-hour forecast
export const get72HourForecast = async (locationCode: number): Promise<HourlyForecast> => {
  return callProxy("hours72", locationCode);
};

// Get 15-day forecast
export const get15DayForecast = async (locationCode: number): Promise<DailyForecast> => {
  return callProxy("days15", locationCode);
};

// Get historical data
export const getHistoricalData = async (
  locationCode: number,
  fromDate: string = "2024-01-01"
): Promise<HistoricalData> => {
  return callProxy("history", locationCode, { fromDate });
};

// Weather condition to icon mapping
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

// Format temperature display
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};
