const buttonKeys = {
  RESET_DATA: 'reset-data'
};

const { constants } = require('../utils/constants');

const buttons = {
  [buttonKeys.RESET_DATA]: async (interaction, { setupGuild }) => {
    const { guild } = interaction;
    const dataChannel = guild.channels.cache.find((channel) => channel.name.includes(constants.DATA_CHANNEL_NAME));
    console.log('reset', 'DEVLOG'); // RMBL
    interaction.reply({ ephemeral: true, content: 'Resetting!' });
    await dataChannel.delete();
    await setupGuild(guild);
  }
};

const buttonHandler = (interaction, buttonPackage) => {
  console.log(interaction.customId, 'DEVLOG'); // RMBL
  if (Object.keys(buttons).includes(interaction.customId)) {
    buttons[interaction.customId](interaction, buttonPackage);
  }
};

module.exports = {
  buttonHandler,
  buttonKeys
};