import { Intent, MessageEntities } from "../models";

/**
 * A message parser to extract the intents and entities from a message.
 * @since 0.1.0
 */
export class MessageParser {
  public constructor(private botUserName: string) {}

  /**
   * Identifies the intent of a message and extracts the entities from it.
   *
   * @param messageText The message as it was sent by the user
   * @returns The entities from the message
   * @since 0.1.0
   */
  public parse(messageText: string): MessageEntities {
    if (!messageText.includes(this.botUserName)) {
      return { utterance: messageText, intent: Intent.None, entities: {} };
    }

    const text = this.cleanText(messageText);

    const match = /^(?<command>hilfe\b).*$|^((?<date>heute\b)?\s*(?:in\s*)?(?<location>.*))$/gi.exec(
      text
    );
    const command = (match?.groups?.command || "").toLowerCase();

    if (text.length === 0 || !match || !match.groups || command === "hilfe") {
      return { utterance: text, intent: Intent.Help, entities: {} };
    }

    return {
      utterance: text,
      intent: match.groups.date ? Intent.WeatherToday : Intent.WeatherForecast,
      entities: {
        location: match.groups.location,
      },
    };
  }

  /**
   * Removes the bots user name from the message.
   *
   * @returns The cleaned text
   */
  private cleanText(messageText: string): string {
    return messageText.replace(this.botUserName, "").trim();
  }
}
