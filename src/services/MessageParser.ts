import { MessageEntities } from "../models";

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
      return { intent: "none" };
    }

    const text = this.cleanText(messageText);

    if (text.length === 0 || /\bhilfe\b/i.test(text)) {
      return { intent: "show_help" };
    }
    return { intent: "forecast_weather", location: text };
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
