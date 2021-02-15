import axios from "axios";
import { CurrentWeatherData, DirectGeocoding } from "../types/open-weather";

const ONE_CALL_API = "https://api.openweathermap.org/data/2.5/onecall";
const DIRECT_GEOCODING_API = "http://api.openweathermap.org/geo/1.0/direct";

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
