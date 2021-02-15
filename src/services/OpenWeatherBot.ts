import NextcloudTalkBot from "nextcloud-talk-bot";
import { MessageGenerator } from "./MessageGenerator";
import { MessageParser } from "./MessageParser";
import { OpenWeatherClient } from "./OpenWeatherClient";

/**
 * This class contains the bots logic.
 * @since 0.1.0
 */
export class OpenWeatherBot {
  /**
   * Create a new instance
   *
   * @param bot The Nextcloud Talk bot
   * @param openWeatherClient The client for the OpenWeather API
   * @since 0.1.0
   */
  public constructor(
    private bot: NextcloudTalkBot,
    private openWeatherClient: OpenWeatherClient,
    private messageParser: MessageParser,
    private messageGenerator: MessageGenerator
  ) {}

  /**
   * Handles an incoming message
   *
   * @param message the incoming message
   * @since 0.1.0
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
   * Retrieves the for weather data for the given location
   * and creates a week forecast of it
   *
   * @param locationName The name of the location
   * @returns The formatted forecast for the requested location
   * @throws If an error occurs when accessing the OpenWeather API
   */
  private async getForecast(locationName: string): Promise<string> {
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
        "de"
      );

      const properties = {
        location: `${locations[0].name}, ${locations[0].country}`,
        daily: weatherData.daily.map((day) => {
          return {
            date: day.dt,
            description: day.weather[0].description,
            icon: day.weather[0].icon,
            minTemp: day.temp.min,
            maxTemp: day.temp.max,
          };
        }),
      };

      return this.messageGenerator.generateForecast(properties);
    } catch (error) {
      // TODO: provide meaningful error message
      console.error(error);
      throw error;
    }
  }

  /**
   * Sends an error message to the specified conversation.
   *
   * @param conversationToken The token of the conversation
   * @param errorMessage The error message to send
   */
  private handleError(conversationToken: string, errorMessage?: string): void {
    const response = this.messageGenerator.generateError(errorMessage);
    this.bot.sendText(response, conversationToken);
  }

  /**
   * Sends an error message to the specified conversation.
   *
   * @param conversationToken The token of the conversation
   */
  private showHelp(conversationToken: string): void {
    const response = this.messageGenerator.generateHelp(this.bot.user);
    this.bot.sendText(response, conversationToken);
  }
}
