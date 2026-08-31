import {
  Routes,
  type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import { getRest } from "./rest";

export async function sendChannelMessage(
  channelId: string,
  body: RESTPostAPIChannelMessageJSONBody,
): Promise<void> {
  await getRest().post(Routes.channelMessages(channelId), { body });
}
