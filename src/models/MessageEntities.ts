export interface MessageEntities {
  /** The intent of the message */
  intent: "none" | "forecast_weather" | "show_help";

  /** The requested location */
  location?: string;
}
