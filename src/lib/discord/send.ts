import {
  Routes,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { RawFile } from "@discordjs/rest";
import { getRest } from "./rest";

export interface SendChannelMessageOptions {
  content?: string;
  embeds?: RESTPostAPIChannelMessageJSONBody["embeds"];
  files?: RawFile[];
}

export async function sendChannelMessage(
  channelId: string,
  options: SendChannelMessageOptions,
): Promise<void> {
  const body: RESTPostAPIChannelMessageJSONBody = {
    content: options.content,
    embeds: options.embeds,
  };

  await getRest().post(Routes.channelMessages(channelId), {
    body,
    files: options.files,
  });
}
