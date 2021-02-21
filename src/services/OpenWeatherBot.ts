import NextcloudTalkBot from "nextcloud-talk-bot";
import { Intent, MessageProperties } from "../models";
import {
  Conversation,
  ConversationType,
  Message,
} from "../types/nextcloud-talk";
import { MessageGenerator } from "./MessageGenerator";
import { MessageParser } from "./MessageParser";
import { OpenWeatherClient } from "./OpenWeatherClient";

const LANGUAGE = "de";

type UserInfo = { userName: string; displayName: string };

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
  public handleMessage(message: Message & { text: string }): void {
    const entities = this.messageParser.parse(message.text);

    switch (entities.intent) {
      case Intent.None:
        break;
      case Intent.Help:
        this.showHelp(message.token);
        break;
      case Intent.WeatherToday:
        this.showCurrent(entities.entities.location!, message.token); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        break;
      default:
        this.showForecast(entities.entities.location!, message.token); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        break;
    }
  }

  /**
   * Handles a new conversation
   *
   * @param conversation The new conversation
   * @since 0.1.0
   */
  public handleNewConversation(conversation: Conversation): void {
    this.bot.joinChannel(conversation.token);

    const botUser = this.getBotUser(conversation);
    const messageProperties: Partial<MessageProperties> = {
      botDisplayName: botUser.displayName,
      botUserName: botUser.userName,
    };

    if (conversation.type === ConversationType.OneToOne) {
      const user = this.getUser(conversation);
      messageProperties.userDisplayName = user.displayName;

      const response = this.messageGenerator.generatePersonalWelcome(
        messageProperties
      );
      this.bot.sendText(response, conversation.token);
    } else {
      const response = this.messageGenerator.generateGroupWelcome(
        messageProperties
      );
      this.bot.sendText(response, conversation.token);
    }
  }

  /**
   * Extracts the display name of the bot from the conversation
   *
   * @param conversation The conversation
   * @returns The username and the display name of the bot user
   */
  private getBotUser(conversation: Conversation): UserInfo {
    return {
      userName: this.bot.user,
      displayName: conversation.participants[this.bot.user].name,
    };
  }

  /**
   * Retrieves the for weather data for the given location
   * and creates a week forecast of it
   *
   * @param locationName The name of the location
   * @returns The forecast data for the requested location
   * @throws If an error occurs when accessing the OpenWeather API
   */
  private async getForecast(
    locationName: string
  ): Promise<Partial<MessageProperties>> {
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
        LANGUAGE
      );

      const localLocationName =
        locations[0].local_names[LANGUAGE] || locations[0].name;

      return {
        location: `${localLocationName}, ${locations[0].country}`,
        current: {
          description: weatherData.current.weather[0].description,
          icon: weatherData.current.weather[0].icon,
          temp: Math.round(weatherData.current.temp),
          feltTemp: Math.round(weatherData.current.feels_like),
          windSpeed: weatherData.current.wind_speed,
        },
        daily: weatherData.daily.map((day) => {
          return {
            date: day.dt,
            description: day.weather[0].description,
            icon: day.weather[0].icon,
            minTemp: Math.round(day.temp.min),
            maxTemp: Math.round(day.temp.max),
            morningTemp: Math.round(day.temp.morn),
            dayTemp: Math.round(day.temp.day),
            eveningTemp: Math.round(day.temp.eve),
            nightTemp: Math.round(day.temp.night),
          };
        }),
      };
    } catch (error) {
      // TODO: provide meaningful error message
      console.error(error);
      throw error;
    }
  }

  /**
   * Extracts the username and the display name of the other participant from
   * the conversation.
   *
   * This is only possible for one-to-one conversations.
   * In group conversations this would just return the first participant.
   *
   * @param conversation The conversation
   * @returns The username and the display name of the other participant
   */
  private getUser(conversation: Conversation): UserInfo {
    const userEntry = Object.entries(conversation.participants).find(
      ([userName]) => userName !== this.bot.user
    );

    return {
      userName: userEntry ? userEntry[0] : "",
      displayName: userEntry ? userEntry[1].name : "",
    };
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
   * Sends a message with the current weather for the given location.
   *
   * @param locationName The name of the location
   * @param conversationToken The token of the conversation
   */
  private showCurrent(locationName: string, conversationToken: string): void {
    this.getForecast(locationName)
      .then((forecast) => {
        const forecastMessage = this.messageGenerator.generateCurrent(forecast);
        this.bot.sendText(forecastMessage, conversationToken);
      })
      .catch((error) => this.handleError(conversationToken, error.message));
  }

  /**
   * Sends a message with a one week weather forecast for the given location.
   *
   * @param locationName The name of the location
   * @param conversationToken The token of the conversation
   */
  private showForecast(locationName: string, conversationToken: string): void {
    this.getForecast(locationName)
      .then((forecast) => {
        const forecastMessage = this.messageGenerator.generateForecast(
          forecast
        );
        this.bot.sendText(forecastMessage, conversationToken);
      })
      .catch((error) => this.handleError(conversationToken, error.message));
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
