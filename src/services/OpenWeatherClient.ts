import axios from "axios";

const ONE_CALL_API = "https://api.openweathermap.org/data/2.5/onecall";
const DIRECT_GEOCODING_API = "http://api.openweathermap.org/geo/1.0/direct";

/** Current and forecast weather data */
export interface CurrentWeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    clouds: number;
    uvi: number;
    visibility: number;
    wind_speed: number;
    wind_gust?: number;
    wind_deg: number;
    rain?: any;
    snow?: any;
    weather: [
      {
        id: number;
        main: string;
        description: string;
        icon: string;
      }
    ];
  };
  minutely: any;
  hourly: any;
  daily: DailyForecast[];
  alerts?: WeatherAlert[];
}

/** Daily forecast weather data */
export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  ];
  clouds: number;
  pop: number;
  uvi: number;
}

/** Direct geocoding, containing the geographical coordinates of a named location */
export interface DirectGeocoding {
  /** Name of the found location */
  name: string;

  /** Name of the found location in different languages. The list of names can be different for different locations */
  local_names: [
    {
      [languageCode: string]: string;
      /** Internal field */
      ascii: string;
      /** Internal field */
      feature_name: string;
    }
  ];

  /** Geographical coordinates of the found location (latitude) */
  lat: number;

  /** Geographical coordinates of the found location (longitude) */
  lon: number;

  /** Country of the found location (ISO 3166 country code) */
  country: string;

  /** State of the found location (only for the US) */
  state?: string;
}

/** National weather alerts data from major national weather warning systems */
export interface WeatherAlert {
  /** Name of the alert source */
  sender_name: string;

  /** Alert event name */
  event: string;

  /** Date and time of the start of the alert, Unix, UTC */
  start: number;

  /** Date and time of the end of the alert, Unix, UTC */
  end: number;

  /**
   * Description of the alert
   *
   * National weather alerts are provided in English by default.
   * Please note that some agencies provide the alert’s description only in a local language.
   */
  description: string;
}

/**
 * A client to access the OpenWeather API.
 */
export class OpenWeatherClient {
  /**
   * Creates a new instance
   *
   * @param apiKey The API key (APPID) which is assigned to your penWeather account.
   */
  public constructor(private apiKey: string) {}

  /**
   * Retrieves the current weather, minute forecast for 1 hour,
   * hourly forecast for 48 hours, daily forecast for 7 days
   * and government weather alerts.
   *
   * This requests makes use of the so called **One Call API**.
   *
   * @param latitude Geographical coordinate (latitude) of the location
   * @param longitude Geographical coordinate (longitude) of the location
   * @param units Units of measurement
   * @param language The language for the output
   * @returns The current weather and forecast
   * @throws If an error occurs
   */
  public async getCurrentWeatherData(
    latitude: number,
    longitude: number,
    units: "metric" | "imperial" | "standard" = "standard",
    language: string = "de"
  ): Promise<CurrentWeatherData> {
    try {
      const response = await axios.get(ONE_CALL_API, {
        params: {
          lat: latitude,
          lon: longitude,
          appId: this.apiKey,
          exclude: "minutely,hourly",
          units: units,
          lang: language,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the geographical coordinates of a named location
   *
   * @param locationName The city name of the location
   * @param stateCode The state code of the location (only for the US)
   * @param countryCode The ISO 3166 country code of the location
   * @returns The geographical coordinates for the location
   * @throws If an error occurs
   */
  public async getCoordinates(
    locationName: string,
    stateCode?: string,
    countryCode?: string
  ): Promise<DirectGeocoding[]> {
    const queryParams = [locationName, stateCode, countryCode].filter(
      (param) => param !== undefined
    );

    try {
      const response = await axios.get(DIRECT_GEOCODING_API, {
        params: {
          q: queryParams.join(","),
          limit: 5,
          appId: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

/** Units of measurement */
export const Units = {
  imperial: {
    clouds: "%",
    humidity: "%",
    pressure: "hPa",
    speed: "mph",
    temperature: "°F",
    visibility: "m",
  },
  metric: {
    clouds: "%",
    humidity: "%",
    pressure: "hPa",
    speed: "m/s",
    temperature: "°C",
    visibility: "m",
  },
  standard: {
    clouds: "%",
    humidity: "%",
    pressure: "hPa",
    speed: "m/s",
    temperature: "K",
    visibility: "m",
  },
};
