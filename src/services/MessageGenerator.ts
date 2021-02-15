import { MessageProperties } from "../types/MessageProperties";
import { Units } from "./OpenWeatherClient";

/**
 * A message generator to create nicely formatted message.
 * @since 0.1.0
 */
export class MessageGenerator {
  private readonly weatherIcons = new Map<string, string>();

  public constructor() {
    this.initWeatherIcons();
  }

  /**
   * Creates an error message.
   *
   * If no error message is provided, a default message will be sent.
   *
   * @param errorMessage The error message to send
   * @returns The error message text
   * @since 0.1.0
   */
  public generateError(errorMessage?: string): string {
    const defaultMessage =
      "🛰 Das Wetter ist gerade auf Forschungsreise für dich. Probiere es in ein paar Minuten noch mal.";
    return errorMessage || defaultMessage;
  }

  /**
   * Creates a one week forecast message.
   *
   * @param properties The forecast data
   * @returns The forecast message text
   * @since 0.1.0
   */
  public generateForecast(properties: MessageProperties): string {
    const daily = properties.daily!.map((day: any) =>
      this.generateDailyForecast(day)
    );

    let message =
      "Hier ist das Wetter für die nächsten Tage in {{LOCATION}}:\n\n" +
      daily.join("\n");
    message = message.replace("{{LOCATION}}", properties.location);
    return message;
  }

  /**
   * Creates the help message.
   *
   * @param botUserName The user name of the bot
   * @returns The help message text
   * @since 0.1.0
   */
  public generateHelp(botUserName: string): string {
    const message =
      "Du möchtest wissen, wie das Wetter ist?\n\n" +
      `- Sende "@${botUserName} London" um eine Wochenvorhersage für einen Ort zu erhalten`;
    return message;
  }

  /**
   * Formats the date as short representation of the weekday
   * and a numeric value of the day in month (e. g. `Fr., 13.`).
   *
   * @param timestamp The Unix timestamp of the date
   * @param language The locale used for the formatting
   * @returns The formatted date
   */
  private formatDate(timestamp: number, language: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
    };
    return new Date(timestamp * 1000).toLocaleDateString(language, options);
  }

  /**
   * Creates a forecast message for a one week forecast.
   *
   * @param dailyProperties The forecast data for a day
   * @returns The forecast for single day
   */
  private generateDailyForecast(dailyProperties: any): string {
    const date = this.formatDate(dailyProperties.date, "de");
    const description = dailyProperties.description;
    const maxTemperature = Math.round(dailyProperties.maxTemp);
    const minTemperature = Math.round(dailyProperties.minTemp);
    const icon = this.getWeatherIcon(dailyProperties.icon);

    return `${date}\t ${icon}\t ${minTemperature} / ${maxTemperature}${Units.metric.temperature}\t ${description}`;
  }

  /**
   * Returns a UTF8 emoji representation of the specified weather icon.
   *
   * @param icon The icon code as provided by OpenWeather
   * @returns An UTF8 emoji
   */
  private getWeatherIcon(icon: string): string {
    return this.weatherIcons.get(icon) || "🌈";
  }

  /**
   * Initializes the internal weather icon map
   */
  private initWeatherIcons(): void {
    // clear sky
    this.weatherIcons.set("01d", "☀️");
    this.weatherIcons.set("01n", "🌌");
    // few clouds
    this.weatherIcons.set("02d", "⛅");
    this.weatherIcons.set("02n", "☁️");
    // scattered clouds
    this.weatherIcons.set("03d", "☁️");
    this.weatherIcons.set("03n", "☁️");
    // broken clouds
    this.weatherIcons.set("04d", "☁️");
    this.weatherIcons.set("04n", "☁️");
    // shower rain
    this.weatherIcons.set("09d", "🌧️");
    this.weatherIcons.set("09n", "🌧️");
    // rain
    this.weatherIcons.set("10d", "🌦️");
    this.weatherIcons.set("10n", "🌦️");
    // thunderstorm
    this.weatherIcons.set("11d", "🌩️");
    this.weatherIcons.set("11n", "🌩️");
    // snow
    this.weatherIcons.set("13d", "❄️");
    this.weatherIcons.set("13n", "❄️");
    // mist
    this.weatherIcons.set("50d", "🌫");
    this.weatherIcons.set("50n", "🌫");
  }
}
