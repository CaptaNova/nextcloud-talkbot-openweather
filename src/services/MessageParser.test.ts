import { Intent, MessageEntities } from "../models";
import { MessageParser } from "./MessageParser";

const botUserName = "someBotUserName";
let sut: MessageParser;

beforeEach(() => {
  sut = new MessageParser(botUserName);
});

describe(MessageParser.name, () => {
  it("does not detect any intent if the bot is not mentioned", () => {
    const entities = sut.parse("some weird text");

    expect(entities).toEqual(<MessageEntities>{
      utterance: "some weird text",
      intent: Intent.None,
      entities: {},
    });
  });

  describe("recognizes 'help' intent", () => {
    it("if the message just mentions the bot", () => {
      const entities = sut.parse(`${botUserName}`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "",
        intent: Intent.Help,
        entities: {},
      });
    });

    it("if the message contains 'hilfe'", () => {
      let entities = sut.parse(`${botUserName} hilfe`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "hilfe",
        intent: Intent.Help,
        entities: {},
      });

      entities = sut.parse(`${botUserName} HiLfE some more text`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "HiLfE some more text",
        intent: Intent.Help,
        entities: {},
      });
    });
  });

  describe("recognizes 'weather.forecast' intent", () => {
    it("if the message contains some text", () => {
      let entities = sut.parse(`${botUserName} in London`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "in London",
        intent: Intent.WeatherForecast,
        entities: { location: "London" },
      });

      entities = sut.parse(`${botUserName} somewhere over the rainbow`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "somewhere over the rainbow",
        intent: Intent.WeatherForecast,
        entities: { location: "somewhere over the rainbow" },
      });
    });
  });

  describe("recognizes 'weather.today' intent", () => {
    it("if the message contains 'heute' and some text", () => {
      let entities = sut.parse(`${botUserName} heute in London`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "heute in London",
        intent: Intent.WeatherToday,
        entities: { location: "London" },
      });

      entities = sut.parse(`${botUserName} heute somewhere over the rainbow`);

      expect(entities).toEqual(<MessageEntities>{
        utterance: "heute somewhere over the rainbow",
        intent: Intent.WeatherToday,
        entities: { location: "somewhere over the rainbow" },
      });
    });
  });
});
