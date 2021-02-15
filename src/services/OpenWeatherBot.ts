import NextcloudTalkBot from "nextcloud-talk-bot";
import { DailyForecast } from "../types/open-weather";
import { MessageParser } from "./MessageParser";
import { OpenWeatherClient, Units } from "./OpenWeatherClient";

/**
 * This class contains the bots logic.
 */
export class OpenWeatherBot {
  /**
   * Create a new instance
   *
   * @param bot The Nextcloud Talk bot
   * @param openWeatherClient The client for the OpenWeather API
   */
  public constructor(
    private bot: NextcloudTalkBot,
    private openWeatherClient: OpenWeatherClient,
    private messageParser: MessageParser
  ) {}

  /**
   * Handles an incoming message
   *
   * @param message the incoming message
   */
  public handleMessage(message: any): void {
    const entities = this.messageParser.parse(message.text);

    if (entities.intent === "none") {
      return;
    }

    if (entities.intent === "forecast_weather" && entities.location) {
      this.getForecast(entities.location)
        .then((forecast) => this.bot.sendText(forecast, message.token))
        .catch((error) => this.handleError(message.token, error.message));
      return;
    }

    this.showHelp(message.token);
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
   * Retrieves the for weather data for the given location
   * and creates a week forecast of it
   *
   * @param locationName The name of the location
   * @returns The formatted forecast for the requested location
   * @throws If an error occurs when accessing the OpenWeather API
   */
  private async getForecast(locationName: string): Promise<string> {
    const language = "de";

    try {
      const locations = await this.openWeatherClient.getCoordinates(
        locationName
      );

      if (locations.length === 0) {
        throw new Error(
          `Ich kenne "${locationName}" leider nicht. 😟 Hast du dich vielleicht vertippt?\nAnsonsten probiere es mal mit dem nächstgrößeren Ort.`
        );
      }

      const weatherData = await this.openWeatherClient.getCurrentWeatherData(
        locations[0].lat,
        locations[0].lon,
        "metric",
        language
      );

      const dailyForecasts = weatherData.daily.map((day) =>
        this.prepareDailyForecast(day, language)
      );

      const response =
        "Hier ist das Wetter für die nächsten Tage in {{LOCATION}}:\n\n" +
        dailyForecasts.join("\n");
      return response.replace(
        "{{LOCATION}}",
        `${locations[0].name}, ${locations[0].country}`
      );
    } catch (error) {
      // TODO: provide meaningful error message
      console.error(error);
      throw error;
    }
  }

  /**
   * Returns a UTF8 emoji representation of the specified weather icon.
   *
   * @param icon The icon code as provided by OpenWeather
   * @returns An UTF8 emoji
   */
  private getWeatherIcon(icon: string): string {
    switch (icon) {
      // clear sky
      case "01d":
        return "☀️";
      case "01n":
        return "🌌";
      // few clouds
      case "02d":
        return "⛅";
      case "02n":
        return "☁️";
      // scattered clouds
      case "03d":
      case "03n":
        return "☁️";
      // broken clouds
      case "04d":
      case "04n":
        return "☁️";
      // shower rain
      case "09d":
      case "09n":
        return "🌧️";
      // rain
      case "10d":
      case "10n":
        return "🌦️";
      // thunderstorm
      case "11d":
      case "11n":
        return "🌩️";
      // snow
      case "13d":
      case "13n":
        return "❄️";
      // mist
      case "50d":
      case "50n":
        return "🌫";
      default:
        return "🌈";
    }
  }

  /**
   * Sends an error message to the specified conversation.
   *
   * If no error message is provided, a default message will be sent.
   *
   * @param conversationToken The token of the conversation
   * @param errorMessage The error message to send
   */
  private handleError(conversationToken: string, errorMessage?: string): void {
    this.bot.sendText(
      errorMessage ||
        "🛰 Das Wetter ist gerade auf Forschungsreise für dich. Probiere es in ein paar Minuten noch mal.",
      conversationToken
    );
  }

  /**
   * Creates a formatted forecast from the given weather data
   *
   * @param day The forecast data of a day
   * @param language The language to use
   * @returns The formatted forecast for the day
   */
  private prepareDailyForecast(day: DailyForecast, language: string): string {
    const date = this.formatDate(day.dt, language);
    const symbol = this.getWeatherIcon(day.weather[0].icon);
    const minTemperature = Math.round(day.temp.min);
    const maxTemperature = Math.round(day.temp.max);
    const description = day.weather[0].description;

    return `${date}\t ${symbol}\t ${minTemperature} / ${maxTemperature}${Units.metric.temperature}\t ${description}`;
  }

  /**
   * Sends an error message to the specified conversation.
   *
   * @param conversationToken The token of the conversation
   */
  private showHelp(conversationToken: string): void {
    const response =
      "Du möchtest wissen, wie das Wetter ist?\n\n" +
      `- Sende "@${this.bot.user} London" um eine Wochenvorhersage für einen Ort zu erhalten`;
    this.bot.sendText(response, conversationToken);
  }
}
