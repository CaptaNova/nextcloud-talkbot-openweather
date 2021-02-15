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
    rain?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    snow?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    weather: [
      {
        id: number;
        main: string;
        description: string;
        icon: string;
      }
    ];
  };
  minutely: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  hourly: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
