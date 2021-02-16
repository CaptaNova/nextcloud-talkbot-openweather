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
 * - Show current weather
 * - Write README (feature description (screenshot), setup instructions, architecture, contributing, versioning, license)
 * - Logging
 * - Poll conversations and join new ones (except 'changelog')
 * - Send welcome message (including instructions) when joining a new conversation
 * - Leave conversation, if the bot is the only member of it
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
import { Conversation, ConversationType } from "./types/nextcloud-talk";
import {
  NEXTCLOUD_URI,
  NEXTCLOUD_USER,
  NEXTCLOUD_PASSWORD,
  OPEN_WEATHER_API_KEY,
} from "./util/secrets";

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
        .filter((channel) => channel.type !== ConversationType.Changelog)
        .filter((channel) => Object.keys(channel.participants).length !== 1)
        .filter((channel) => !bot.inChannel(channel.token))
        .forEach((channel) => bot.joinChannel(channel.token));
    })
    .finally(() => {
      bot.startPolling();
    });
}

/**
 * Retrieves all conversations of the bots user.
 *
 * @param bot The Nextcloud Talk bot
 * @returns All conversations of the bots user
 */
async function getConversations(
  bot: NextcloudTalkBot
): Promise<Conversation[]> {
  let conversations: Conversation[] = [];

  try {
    const response = await bot._request("room");

    if (response.type === "error") {
      console.warn(response.response);
    }

    if (response.type === "response") {
      conversations = response.data;
    }
  } catch (error) {
    console.error(error);
  }

  return conversations;
}
