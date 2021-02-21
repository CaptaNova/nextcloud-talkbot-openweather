import { MessageProperties } from "../models";
import { MessageGenerator } from "./MessageGenerator";

const botUserName = "someBotUserName";
const botDisplayName = "someBotDisplayName";
const userDisplayName = "someUserDisplayName";
const baseDate = new Date("2020-04-01T00:00:00Z").getTime() / 1000;
const oneDay = 60 * 60 * 24;

let sut: MessageGenerator;
let properties: Partial<MessageProperties>;

beforeEach(() => {
  properties = {
    location: "somewhere over the rainbow",
    current: {
      description: "frozen world",
      icon: "01n",
      temp: 12,
      feltTemp: 34,
      windSpeed: 5.6,
    },
    daily: [0, 0, 0].map((_, index) => {
      return {
        date: baseDate + index * oneDay,
        description: "excellent weather",
        icon: `0${index}d`,
        minTemp: -9.8,
        maxTemp: 20.2,
        morningTemp: 1.2,
        dayTemp: 3.4,
        eveningTemp: 5.6,
        nightTemp: 7.8,
      };
    }),
  };

  sut = new MessageGenerator();
});

describe(MessageGenerator.name, () => {
  it("returns a German help message", () => {
    const message = sut.generateHelp(botUserName);

    expect(message).toContain(`Sende \"@${botUserName}`);
  });

  it("returns the provided error message", () => {
    const errorMessage = "I am an error message";
    const message = sut.generateError(errorMessage);

    expect(message).toBe(errorMessage);
  });

  it("returns a default error message if none is provided", () => {
    let message = sut.generateError();

    expect(message).toContain("Forschungsreise");

    message = sut.generateError("");

    expect(message).toContain("Forschungsreise");
  });

  describe("returns a group welcome message", () => {
    let message: string;

    beforeEach(() => {
      properties = { botDisplayName: botDisplayName, botUserName: botUserName };
      message = sut.generateGroupWelcome(properties);
    });

    it("includes the bots display name", () => {
      expect(message).toContain(botDisplayName);
    });
  });

  describe("returns a personal welcome message", () => {
    let message: string;

    beforeEach(() => {
      properties = {
        botDisplayName: botDisplayName,
        botUserName: botUserName,
        userDisplayName: userDisplayName,
      };
      message = sut.generatePersonalWelcome(properties);
    });

    it("includes the bots display name", () => {
      expect(message).toContain(botDisplayName);
    });

    it("includes the users display name", () => {
      expect(message).toContain(userDisplayName);
    });
  });

  describe("returns the current weather", () => {
    let message: string;

    beforeEach(() => {
      message = sut.generateCurrent(properties);
    });

    it("includes the location name", () => {
      expect(message).toContain(properties.location);
    });

    it("includes a UTF8 emoji representation of the current weather icon", () => {
      expect(message).toContain("🌌");
    });

    it("includes the current temperature", () => {
      expect(message).toContain("12 °C");
    });

    it("includes the felt temperature", () => {
      expect(message).toMatch(
        new RegExp(`Fühlt.*${properties.current!.feltTemp}`)
      );
    });

    it("includes the description", () => {
      expect(message).toContain(properties.current!.description);
    });

    it("includes a textual description of the wind speed", () => {
      expect(message).toContain("Mäßige Brise");
    });

    it("includes the morning temperature", () => {
      expect(message).toMatch(
        new RegExp(`morgens:\\s*${properties.daily![0].morningTemp}`)
      );
    });

    it("includes the day temperature", () => {
      expect(message).toMatch(
        new RegExp(`mittags:\\s*${properties.daily![0].dayTemp}`)
      );
    });

    it("includes the evening temperature", () => {
      expect(message).toMatch(
        new RegExp(`abends:\\s*${properties.daily![0].eveningTemp}`)
      );
    });

    it("includes the night temperature", () => {
      expect(message).toMatch(
        new RegExp(`nachts:\\s*${properties.daily![0].nightTemp}`)
      );
    });
  });

  describe("returns the one week forecast", () => {
    let message: string;

    beforeEach(() => {
      message = sut.generateForecast(properties);
    });

    it("includes the location name", () => {
      expect(message).toContain(`Tage in ${properties.location}`);
    });

    it("includes the short date", () => {
      expect(message).toContain("Mi., 1.");
      expect(message).toContain("Do., 2.");
      expect(message).toContain("Fr., 3.");
    });

    it("includes a UTF8 emoji representation of the weather icon", () => {
      expect(message).toContain("🌈");
      expect(message).toContain("☀️");
      expect(message).toContain("⛅");
    });

    it("rounds the temperatures", () => {
      expect(message).toContain("-10 / 20°C");
    });

    it("includes the description", () => {
      expect(message).toContain(properties.daily![0].description); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    });
  });
});
