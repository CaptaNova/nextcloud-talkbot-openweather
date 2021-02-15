/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "nextcloud-talk-bot" {
  class NextcloudTalkBot {
    user: string;

    constructor(options = {});

    on(event: "message" | "system", listener: (message: any) => void): void;

    getChannel(channelId: string, join?: boolean): any;

    inChannel(channelId: string): boolean;

    joinChannel(channelId: string, name?: string): boolean;

    onText(
      regxt: RegExp | string,
      callback: (message: any) => void,
      channelId?: string
    ): this;

    sendText(text: string, channelId: string, messageId?: number): fetch;

    startPolling(isAutoJoinRequest?: boolean): void;

    _request(
      path: string,
      opt = {}
    ): Promise<
      | { type: "error"; response: any }
      | { type: "response"; data: any; headers: any }
      | { type: "unchanged" }
    >;
  }

  export = NextcloudTalkBot;
}
