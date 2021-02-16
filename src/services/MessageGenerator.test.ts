import { MessageProperties } from "../models";
import { MessageGenerator } from "./MessageGenerator";

const botUserName = "someBotUserName";
let sut: MessageGenerator;

beforeEach(() => {
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

  describe("returns the one week forecast", () => {
    const baseDate = new Date("2020-04-01T00:00:00Z").getTime() / 1000;
    const oneDay = 60 * 60 * 24;
    let properties: MessageProperties;
    let message: string;

    beforeEach(() => {
      properties = {
        location: "somewhere over the rainbow",
        daily: [0, 0, 0].map((_, index) => {
          return {
            date: baseDate + index * oneDay,
            description: "excellent weather",
            icon: `0${index}d`,
            minTemp: -9.8,
            maxTemp: 20.2,
          };
        }),
      };

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
