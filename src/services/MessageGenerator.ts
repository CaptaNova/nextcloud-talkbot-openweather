import { WEATHER_ICONS } from "../constants";
import { MessageProperties } from "../models";
import { Units } from "./OpenWeatherClient";

/**
 * A message generator to create nicely formatted message.
 * @since 0.1.0
 */
export class MessageGenerator {
  // TODO: https://discover.bot/bot-talk/chatbot-welcome-message/
  // TODO: https://www.tidio.com/blog/welcome-message/
  // TODO: Moment, ich muss noch schnell meine Glaskugel 🔮 polieren ...
  // TODO: Moment. Ich geh kurz raus und schau mal nach. 🏃\nBin gleich zurück ...

  /**
   * Creates a current weather message.
   *
   * @param properties The weather data
   * @returns The current weather message text
   * @since 0.1.0
   */
  public generateCurrent(properties: Partial<MessageProperties>): string {
    const message =
      "{{LOCATION}}\n" +
      "{{CURRENT_ICON}} {{CURRENT_TEMPERATURE}} {{UNIT_TEMP}}\n" +
      "{{CURRENT_DESCRIPTION}}. {{CURRENT_WIND_DESCRIPTION}}.\n" +
      "Fühlt sich an wie {{CURRENT_FEEL_TEMP}} {{UNIT_TEMP}}.\n\n" +
      // TODO: "Kein Niederschlag innerhalb der nächsten Stunde.\n\n"
      // TODO: icons für die jeweilige Uhrzeit
      "morgens:\t {{TODAY_MORNING_TEMP}} {{UNIT_TEMP}}\n" +
      "mittags:\t\t {{TODAY_DAY_TEMP}} {{UNIT_TEMP}}\n" +
      "abends:\t\t {{TODAY_EVENING_TEMP}} {{UNIT_TEMP}}\n" +
      "nachts:\t\t {{TODAY_NIGHT_TEMP}} {{UNIT_TEMP}}";

    return this.replacePlaceholder(message, properties);
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
  public generateForecast(properties: Partial<MessageProperties>): string {
    const daily = (properties.daily || []).map((day) =>
      this.generateDailyForecast(day)
    );

    const message =
      "Hier ist das Wetter für die nächsten Tage in {{LOCATION}}:\n\n" +
      daily.join("\n");
    return this.replacePlaceholder(message, properties);
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
      "Du möchtest wissen, wie das Wetter ist?\n\n" + this.getCommandExamples();
    return this.replacePlaceholder(message, { botUserName });
  }

  /**
   * Creates a welcome message for a group conversation.
   *
   * @param properties The message properties
   * @returns The welcome message for a group conversation
   */
  public generateGroupWelcome(properties: Partial<MessageProperties>): string {
    // Hey there! 👋 I'm {{BOT_NAME}}, your friendly weatherman.
    const message =
      "Hallo zusammen! 👋 Ich bin {{BOT_NAME}}, euer freundlicher Wetterfrosch. QUAK 🐸\n\n" +
      "Ihr möchtet wissen, wie das Wetter wird?\n\n" +
      this.getCommandExamples();

    return this.replacePlaceholder(message, properties);
  }

  /**
   * Creates a welcome message for a one-to-one conversation.
   *
   * @param properties The message properties
   * @returns The welcome message for a one-to-one conversation
   */
  public generatePersonalWelcome(
    properties: Partial<MessageProperties>
  ): string {
    // Hi, {{USER_NAME}}! 👋 My name is {{BOT_USERNAME}}, and I'm your personal weatherman.
    // You can ask me for the current weather or get a forecast for your city or favorite location.
    const message =
      "Hallo {{USER_NAME}}! 👋 Mein Name ist {{BOT_NAME}} und ich bin dein persönlicher Wetterfrosch. QUAK 🐸\n\n" +
      "Du kannst mich nach dem aktuellen Wetter fragen oder eine Vorhersage für deinen Lieblingsort erhalten.\n\n" +
      this.getCommandExamples();

    return this.replacePlaceholder(message, properties);
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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private generateDailyForecast(dailyProperties: any): string {
    const date = this.formatDate(dailyProperties.date, "de");
    const description = dailyProperties.description;
    const maxTemperature = Math.round(dailyProperties.maxTemp);
    const minTemperature = Math.round(dailyProperties.minTemp);
    const icon = this.getWeatherIcon(dailyProperties.icon);

    return `${date}\t ${icon}\t ${minTemperature} / ${maxTemperature}${Units.metric.temperature}\t ${description}`;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  /**
   * Returns a message containing usage examples.
   *
   * @returns Some usage examples
   */
  private getCommandExamples(): string {
    return (
      '- Sende "@{{BOT_USERNAME}} London" um eine Wochenvorhersage für London zu erhalten\n' +
      '- Sende "@{{BOT_USERNAME}} heute London" um das aktuelle Wetter für London zu erhalten'
    );
  }

  /**
   * Returns a textual description of the specified wind speed.
   *
   * @param windSpeed The wind speed in metre/sec
   * @returns A textual description of the wind speed
   */
  private getWindDescription(windSpeed: number): string {
    if (windSpeed <= 1.5) {
      return "Leichter Zug"; // Light air
    }
    if (windSpeed <= 3.5) {
      return "Leichter Wind"; // Light breeze
    }
    if (windSpeed <= 5.5) {
      return "Schwache Brise"; // Gentle breeze
    }
    if (windSpeed <= 8.0) {
      return "Mäßige Brise"; // Moderate breeze
    }
    if (windSpeed <= 11.0) {
      // TODO: not sure about the limit
      return "Frische Brise"; // Fresh breeze
    }
    // TODO: not sure if there are more speed ranges
    return "Starker Wind"; // Strong breeze
  }

  /**
   * Returns a UTF8 emoji representation of the specified weather icon.
   *
   * @param icon The icon code as provided by OpenWeather
   * @returns An UTF8 emoji
   */
  private getWeatherIcon(icon: string): string {
    return WEATHER_ICONS[icon] || "🌈";
  }

  /**
   * Replaces the placeholders in the message with the corresponding content
   * from the message properties.
   *
   * @param message The message including placeholders
   * @param properties The message properties
   * @returns The message with placeholders replaced by the corresponding content
   */
  private replacePlaceholder(
    message: string,
    properties: Partial<MessageProperties>
  ): string {
    let transformedMessage = message
      .replace(/{{UNIT_SPEED}}/g, Units.metric.speed)
      .replace(/{{UNIT_TEMP}}/g, Units.metric.temperature);

    if (properties.botDisplayName) {
      // prettier-ignore
      transformedMessage = transformedMessage.replace(/{{BOT_NAME}}/g, properties.botDisplayName);
    }

    if (properties.botUserName) {
      // prettier-ignore
      transformedMessage = transformedMessage.replace(/{{BOT_USERNAME}}/g, properties.botUserName);
    }

    if (properties.userDisplayName) {
      // prettier-ignore
      transformedMessage = transformedMessage.replace(/{{USER_NAME}}/g, properties.userDisplayName);
    }

    if (properties.location) {
      // prettier-ignore
      transformedMessage = transformedMessage.replace(/{{LOCATION}}/g, properties.location);
    }

    if (properties.current) {
      // prettier-ignore
      transformedMessage = transformedMessage
        .replace(/{{CURRENT_DESCRIPTION}}/g, properties.current.description)
        .replace(/{{CURRENT_FEEL_TEMP}}/g, properties.current.feltTemp.toString(10))
        .replace(/{{CURRENT_ICON}}/g, this.getWeatherIcon(properties.current.icon))
        .replace(/{{CURRENT_TEMPERATURE}}/g, properties.current.temp.toString(10))
        .replace(/{{CURRENT_WIND_DESCRIPTION}}/g, this.getWindDescription(properties.current.windSpeed))
        .replace(/{{CURRENT_WIND_SPEED}}/g, properties.current.windSpeed.toString(10));
    }

    if (properties.daily) {
      // prettier-ignore
      transformedMessage = transformedMessage
        .replace(/{{MAX_TEMPERATURE}}/g, properties.daily[0].maxTemp.toString(10))
        .replace(/{{MIN_TEMPERATURE}}/g, properties.daily[0].minTemp.toString(10))
        .replace(/{{TODAY_DAY_TEMP}}/g, properties.daily[0].dayTemp.toString(10))
        .replace(/{{TODAY_EVENING_TEMP}}/g, properties.daily[0].eveningTemp.toString(10))
        .replace(/{{TODAY_MORNING_TEMP}}/g, properties.daily[0].morningTemp.toString(10))
        .replace(/{{TODAY_NIGHT_TEMP}}/g, properties.daily[0].nightTemp.toString(10));
    }

    return transformedMessage;
  }
}
