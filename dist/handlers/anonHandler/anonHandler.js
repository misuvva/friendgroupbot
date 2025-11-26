"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAnonCommands = void 0;
const discord_js_1 = require("discord.js");
// @ts-ignore
const commands_1 = require("../../commands");
// @ts-ignore
const utils_1 = require("../dmHandler/utils");
const setupAnonCommands = (guild) => {
    (0, commands_1.createCommand)(guild, {
        name: 'say',
        description: 'say something anonymously',
        execute: async (interaction) => {
            await interaction.reply({ ephemeral: true, content: 'said anonymously!' });
            const commandContent = interaction.options.getString('what');
            const pseudonym = (0, utils_1.getPseudonym)(guild, interaction.member.user.id);
            if (interaction.channel instanceof discord_js_1.TextChannel) {
                interaction.channel.send({
                    content: `***${pseudonym}:*** ${commandContent}`
                });
            }
        },
        options: [
            {
                name: 'what',
                description: 'the content of the message you want to send',
                type: 3,
                required: true
            }
        ]
    });
};
exports.setupAnonCommands = setupAnonCommands;
