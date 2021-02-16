// import logger from "./logger";
import dotenv from "dotenv";
import { existsSync } from "fs";

if (!existsSync(".env")) {
  console.error(
    "No .env file found. Copy .env.example to .env and fill in your data."
  );
  process.exit(1);
}

dotenv.config();

export const NEXTCLOUD_URI = process.env["NEXTCLOUD_URI"];
export const NEXTCLOUD_USER = process.env["NEXTCLOUD_USER"];
export const NEXTCLOUD_PASSWORD = process.env["NEXTCLOUD_PASSWORD"];
export const OPEN_WEATHER_API_KEY = process.env["OPEN_WEATHER_API_KEY"];

if (!NEXTCLOUD_URI) {
  console.error("No Nextcloud uri. Set NEXTCLOUD_URI environment variable.");
  process.exit(1);
}

if (!NEXTCLOUD_USER) {
  console.error(
    "No Nextcloud username. Set NEXTCLOUD_USER environment variable."
  );
  process.exit(1);
}

if (!NEXTCLOUD_PASSWORD) {
  console.error(
    "No Nextcloud password. Set NEXTCLOUD_PASSWORD environment variable."
  );
  process.exit(1);
}

if (!OPEN_WEATHER_API_KEY) {
  console.error(
    "No OpenWeather API key. Set OPEN_WEATHER_API_KEY environment variable."
  );
  process.exit(1);
}
