import { ButtonInteraction, Guild } from 'discord.js';
import { constants } from '../utils/constants';

export const buttonKeys = {
  RESET_DATA: 'reset-data'
};

const buttons = {
  [buttonKeys.RESET_DATA]: async (interaction: ButtonInteraction, { setupGuild }: { setupGuild: (guild: Guild) => Promise<void> }) => {
    const { guild } = interaction;
    if (!guild) return;
    const dataChannel = guild.channels.cache.find((channel) => channel.name.includes(constants.DATA_CHANNEL_NAME));
    interaction.reply({ ephemeral: true, content: 'Resetting!' });
    if (dataChannel) {
      await dataChannel.delete();
    }
    await setupGuild(guild);
  }
};

export const buttonHandler = (interaction: ButtonInteraction, buttonPackage: any) => {
  if (Object.keys(buttons).includes(interaction.customId)) {
    buttons[interaction.customId as keyof typeof buttons](interaction, buttonPackage);
  }
};
