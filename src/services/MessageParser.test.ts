import { MessageEntities } from "../types/MessageEntities";
import { MessageParser } from "./MessageParser";

const botUserName = "someBotUserName";
let sut: MessageParser;

beforeEach(() => {
  sut = new MessageParser(botUserName);
});

describe(MessageParser.name, () => {
  it("does not detect any intent if the bot is not mentioned", () => {
    const entities = sut.parse("some weird text");

    expect(entities).toEqual(<MessageEntities>{ intent: "none" });
  });

  describe("recognizes 'show_help' intent", () => {
    it("if the message just mentions the bot", () => {
      const entities = sut.parse(`${botUserName}`);

      expect(entities).toEqual(<MessageEntities>{ intent: "show_help" });
    });

    it("if the message contains 'hilfe'", () => {
      let entities = sut.parse(`${botUserName} hilfe`);

      expect(entities).toEqual(<MessageEntities>{ intent: "show_help" });

      entities = sut.parse(`${botUserName} HiLfE some more text`);

      expect(entities).toEqual(<MessageEntities>{ intent: "show_help" });
    });
  });

  describe("recognizes 'forecast_weather' intent", () => {
    it("if the message contains some text", () => {
      let entities = sut.parse(`${botUserName} London`);

      expect(entities).toEqual(<MessageEntities>{
        intent: "forecast_weather",
        location: "London",
      });

      entities = sut.parse(`${botUserName} somewhere over the rainbow`);

      expect(entities).toEqual(<MessageEntities>{
        intent: "forecast_weather",
        location: "somewhere over the rainbow",
      });
    });
  });
});
