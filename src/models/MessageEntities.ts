import { Intent } from "./Intent";

export interface MessageEntities {
  utterance: string;

  /** The intent of the message */
  intent: Intent;

  entities: {
    /** The requested location */
    location?: string;
  };
}
