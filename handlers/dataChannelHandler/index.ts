/* eslint-disable quotes */
/* eslint-disable consistent-return */

import { Guild, TextChannel } from 'discord.js';
import { constants } from "../../utils/constants";

export const getData = async (guild: Guild) => {
  const channels = await guild.channels.fetch();
  const dataChannel = channels.find(
    (channel) => channel?.name === constants.DATA_CHANNEL_NAME
  ) as TextChannel;

  if (!dataChannel) return;
  const dataChannelMessages = await dataChannel.messages.fetch({ limit: 100 });
  const dailyMessagesSettingsMessage = dataChannelMessages.find((message) =>
    message.content.includes("settings for the daily messages")
  );
  if (!dailyMessagesSettingsMessage) return;
  const dailyMessagesSettingsString = `{${dailyMessagesSettingsMessage.content.split("{")[1].split("}")[0]
    }}`
    .split("\n")
    .join("");

  try {
    const dailyMessagesSettings = JSON.parse(dailyMessagesSettingsString);
    const birthdaysMessage = dataChannelMessages.find((message) =>
      message.content.includes("list of birthdays")
    );
    if (!birthdaysMessage) return { dailyMessagesSettings };

    const birthdaysString = `{${birthdaysMessage.content
      .split("{")[1]
      .split("}")[0]
      .split("\n")
      .join("")}}`;
    const birthdays = JSON.parse(birthdaysString);
    return {
      dailyMessagesSettings,
      birthdays,
    };
  } catch (error) {
    console.error(error);
  }
};
