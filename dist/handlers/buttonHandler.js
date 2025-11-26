"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonHandler = exports.buttonKeys = void 0;
const constants_1 = require("../utils/constants");
exports.buttonKeys = {
    RESET_DATA: 'reset-data'
};
const buttons = {
    [exports.buttonKeys.RESET_DATA]: async (interaction, { setupGuild }) => {
        const { guild } = interaction;
        if (!guild)
            return;
        const dataChannel = guild.channels.cache.find((channel) => channel.name.includes(constants_1.constants.DATA_CHANNEL_NAME));
        interaction.reply({ ephemeral: true, content: 'Resetting!' });
        if (dataChannel) {
            await dataChannel.delete();
        }
        await setupGuild(guild);
    }
};
const buttonHandler = (interaction, buttonPackage) => {
    if (Object.keys(buttons).includes(interaction.customId)) {
        buttons[interaction.customId](interaction, buttonPackage);
    }
};
exports.buttonHandler = buttonHandler;
