/**
 * This is a chat bot which connects to Nextcloud Talk
 * and looks up the weather for a location on OpenWeather,
 * if it is asḱed for it.
 *
 * Find the setup instructions in the projects {@link README.md}.
 *
 * Supported languages:
 * - German
 *
 * TODO:
 * - Stop polling deleted conversations
 * - Leave conversation, if the bot is the only member of it
 * - Check license (AGPL, MIT)
 * - Write README (feature description (screenshot), setup instructions, architecture, contributing, versioning, license)
 * - Logging
 * - Set default location
 * - Internationalization
 */

import NextcloudTalkBot from "nextcloud-talk-bot";
import {
  MessageGenerator,
  MessageParser,
  OpenWeatherBot,
  OpenWeatherClient,
} from "./services";
import { Conversation } from "./types/nextcloud-talk";
import {
  NEXTCLOUD_URI,
  NEXTCLOUD_USER,
  NEXTCLOUD_PASSWORD,
  OPEN_WEATHER_API_KEY,
} from "./util/secrets";

const CONVERSATION_POLL_RATE = 45 * 1000;

process.on("uncaughtException", (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at ", promise, `reason: ${reason}`);
  process.exit(1);
});

const bot = new NextcloudTalkBot({
  server: NEXTCLOUD_URI,
  user: NEXTCLOUD_USER,
  pass: NEXTCLOUD_PASSWORD,
  autoJoin: false,
  // setReadMarker: true
  debug: false,
});
const openWeatherClient = new OpenWeatherClient(OPEN_WEATHER_API_KEY!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
const messageParser = new MessageParser(bot.user);
const messageGenerator = new MessageGenerator();
const weatherBot = new OpenWeatherBot(
  bot,
  openWeatherClient,
  messageParser,
  messageGenerator
);

bot.on("message", (msg) => weatherBot.handleMessage(msg));
joinConversations(bot);

setInterval(() => {
  getConversations(bot)
    .then((conversations) => {
      conversations
        .filter(filterReadonlyConversations)
        .filter(filterEmptyConversations)
        .filter((conversation) => !bot.inChannel(conversation.token))
        .forEach((conversation) => {
          bot.joinChannel(conversation.token);
          // weatherBot.handleNewConversation(conversation);
        });
    })
    .catch(console.error);
}, CONVERSATION_POLL_RATE);

/**
 * Filter function to exclude readonly conversations
 *
 * @param conversation A conversation
 * @returns `FALSE` if the conversation is readonly, `TRUE` otherwise
 */
function filterReadonlyConversations(conversation: Conversation): boolean {
  return !conversation.readOnly;
}

/**
 * Filter function to exclude conversations with a single participant
 *
 * @param conversation A conversation
 * @returns `FALSE` if the conversation has multiple participants, `TRUE` otherwise
 */
function filterEmptyConversations(conversation: Conversation): boolean {
  return Object.keys(conversation.participants).length !== 1;
}

/**
 * Joins all conversations, except changelogs.
 * Afterwards it starts polling for new messages.
 *
 * @param bot The Nextcloud Talk bot
 */
async function joinConversations(bot: NextcloudTalkBot): Promise<void> {
  getConversations(bot)
    .then((conversations) => {
      conversations
        .filter(filterReadonlyConversations)
        .filter(filterEmptyConversations)
        .filter((conversation) => !bot.inChannel(conversation.token))
        .forEach((conversation) => bot.joinChannel(conversation.token));
    })
    .catch(console.error)
    .finally(() => bot.startPolling());
}

/**
 * Retrieves all conversations of the bots user.
 *
 * @param bot The Nextcloud Talk bot
 * @returns All conversations of the bots user
 * @throws If an error occurs when loading the conversations
 */
async function getConversations(
  bot: NextcloudTalkBot
): Promise<Conversation[] | never> {
  const response = await bot._request("room");

  if (response.type === "error") {
    console.warn(response.response);
  }

  return response.type === "response" ? response.data : [];
}
