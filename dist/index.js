"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const lodash_1 = __importDefault(require("lodash"));
const discord_js_1 = require("discord.js");
const discordModals = require('discord-modals');
// Handlers - assuming these will be migrated to TS or are compatible JS
const reminderHandler_1 = require("./handlers/reminderHandler/reminderHandler");
const dmHandler_1 = require("./handlers/dmHandler/dmHandler");
const editableMessageHandler_1 = require("./handlers/editableMessageHandler/editableMessageHandler");
const statusHandler_1 = require("./handlers/statusHandler/statusHandler");
const errorHandler_1 = require("./handlers/errorHandler/errorHandler");
const voiceChatHandler_1 = require("./handlers/voiceChatHandler/voiceChatHandler");
const utils_1 = require("./utils/utils");
const commands_1 = require("./commands");
const server_1 = require("./server");
const buttonHandler_1 = require("./handlers/buttonHandler");
const constants_1 = require("./utils/constants");
const morningMessageHandler_1 = require("./handlers/morningMessageHandler/morningMessageHandler");
// invite link https://discord.com/oauth2/authorize?client_id=1111063850561843303&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A53134&response_type=code&scope=applications.commands%20bot
(0, server_1.Oauth2Server)();
const intents = new discord_js_1.Intents();
intents.add([discord_js_1.Intents.FLAGS.DIRECT_MESSAGES]);
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.DIRECT_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES,
        discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        discord_js_1.Intents.FLAGS.DIRECT_MESSAGES,
    ],
    partials: ['CHANNEL', 'MESSAGE', 'REACTION', 'USER', 'GUILD_MEMBER', 'GUILD_SCHEDULED_EVENT']
});
const { get } = lodash_1.default;
discordModals(client);
client.once('ready', async () => {
    try {
        const updateCachedMessages = async (guild) => {
            try {
                const promises = guild.channels.cache.map(async (guildChannel) => {
                    if (get(guildChannel, 'parent.name') !== 'archive' && guildChannel.type === 'GUILD_TEXT') {
                        guildChannel.messages.fetch({ limit: 100 });
                    }
                });
                await Promise.all(promises);
            }
            catch (error) {
                (0, errorHandler_1.errorHandler)(error);
            }
        };
        const messageHandler = async (message) => {
            if (message.partial) {
                try {
                    await message.fetch();
                }
                catch (error) {
                    console.error('Something went wrong when fetching the message: ', error);
                    return;
                }
            }
            const fullMessage = message;
            const { guild } = fullMessage;
            try {
                if (!fullMessage.author.bot && guild) {
                    updateCachedMessages(guild);
                    if (get(fullMessage, 'channel.type') === 'DM') {
                        (0, dmHandler_1.dmHandler)(fullMessage, guild);
                    }
                    else if (get(fullMessage, 'channel.name')?.includes('announcements')) {
                        const hasChannelMentions = get(fullMessage, 'mentions.channels.size') > 0;
                        const includesAtOrChannel = fullMessage.mentions.everyone || hasChannelMentions;
                        if (!includesAtOrChannel) {
                            fullMessage.member?.send(`Hey, your message in #announcements in ${guild.name} was deleted because it ` +
                                `didnt include an @everyone or a channel mention. If you meant to reply to a previous announcement, ` +
                                `please do so in the channel linked by that announcement. Just in case, ` +
                                `you said: ${get(fullMessage, 'content')} `);
                            await fullMessage.delete();
                        }
                        else {
                            let threadNameArray = [];
                            const threadNameLength = (0, utils_1.pick)([3, 4, 5]);
                            for (let i = 0; i < threadNameLength; i++) {
                                threadNameArray.push((0, utils_1.pick)(fullMessage.content.split(' ')));
                            }
                            const threadName = threadNameArray
                                .join(' ')
                                .replace(/[^a-zA-Z\d\s]/, (0, utils_1.pick)(['x', 'U', 'L', 'hhh', 'm']));
                            fullMessage.startThread({ name: threadName });
                        }
                    }
                    else if (get(fullMessage, 'channel.name') === constants_1.constants.DATA_CHANNEL_NAME) {
                        fullMessage.delete();
                    }
                }
            }
            catch (error) {
                (0, errorHandler_1.errorHandler)(error);
            }
        };
        client.on('messageCreate', messageHandler);
        client.on('voiceStateUpdate', (oldState, newState) => {
            const { guild } = oldState;
            try {
                (0, voiceChatHandler_1.updateVoiceChats)(oldState, newState, guild);
            }
            catch (error) {
                (0, errorHandler_1.errorHandler)(error);
            }
        });
        client.on('modalSubmit', (modal) => {
            if (modal.customId === editableMessageHandler_1.editableMessageHandlers.constants.editModalId) {
                editableMessageHandler_1.editableMessageHandlers.modalSubmit({ modal });
            }
        });
        const isCatalogMessage = async (message) => (message.content.includes('catalog')
            && message.author.id === client.user?.id
            && message.channel.name.includes('catalog'));
        const getRoleFromCatalog = (messageReaction, message) => {
            const games = message.content.split('\n').slice(1);
            const game = games.find(game => game.includes(messageReaction.emoji.name));
            if (!game)
                return null;
            const roleMention = game.split(' ')[3];
            const roleId = roleMention.slice(3, -1);
            const role = message.guild?.roles.cache.find((role) => role.id === roleId);
            return role;
        };
        client.on('messageReactionAdd', async (messageReaction, user) => {
            const { channel } = messageReaction.message;
            const message = (await channel.messages.fetch(messageReaction.message.id));
            if (await isCatalogMessage(message)) {
                if (message.content.includes(messageReaction.emoji.name)) {
                    const role = getRoleFromCatalog(messageReaction, message);
                    if (role) {
                        const member = message.guild?.members.cache.find(member => member.user.id === user.id);
                        await member?.roles.add(role);
                    }
                }
            }
        });
        client.on('messageReactionRemove', async (messageReaction, user) => {
            const { channel } = messageReaction.message;
            const message = (await channel.messages.fetch(messageReaction.message.id));
            if (await isCatalogMessage(message)) {
                if (message.content.includes(messageReaction.emoji.name)) {
                    const role = getRoleFromCatalog(messageReaction, message);
                    if (role) {
                        const member = message.guild?.members.cache.find(member => member.user.id === user.id);
                        await member?.roles.remove(role);
                    }
                }
            }
        });
        client.on('threadCreate', async (thread) => {
            try {
                const { guild } = thread;
                const generalChannnel = guild.channels.cache.find(channel => channel.name.includes('general'));
                if (!generalChannnel || !generalChannnel.isText())
                    return;
                const owner = await thread.fetchOwner();
                if (!owner || !owner.user)
                    return;
                const ownerName = owner.guildMember?.displayName || owner.user.username;
                const starterMessage = await thread.fetchStarterMessage();
                if (!starterMessage)
                    return;
                await thread.setAutoArchiveDuration(1440);
                const joinThreadButton = {
                    content: `Press this button to join this thread`,
                    components: [
                        new discord_js_1.MessageActionRow({
                            components: [
                                (0, reminderHandler_1.createButton)({
                                    label: 'Join Thread',
                                    style: 'PRIMARY',
                                    customId: `join-thread-${thread.id}`,
                                    onPress: async (interaction) => {
                                        await thread.members.add(interaction.member);
                                        interaction.reply({ ephemeral: true, content: 'Added!' });
                                    }
                                })
                            ]
                        })
                    ]
                };
                thread.send(joinThreadButton);
                if (owner.user.bot)
                    return;
                generalChannnel.send({
                    content: `**${ownerName}** just created a thread in ${thread.parent}`
                        + ` on *"${starterMessage.content.replace('@', '@-')}"*`
                        + ` called: ${thread}`,
                    components: [
                        new discord_js_1.MessageActionRow({
                            components: [
                                (0, reminderHandler_1.createButton)({
                                    label: 'Join Thread',
                                    style: 'PRIMARY',
                                    customId: `join-thread-${thread.id}`,
                                    onPress: async (interaction) => {
                                        thread.members.add(interaction.member);
                                        interaction.reply({ ephemeral: true, content: 'Added!' });
                                    }
                                })
                            ]
                        })
                    ]
                });
            }
            catch (error) {
                throw Error(`onThreadCreate Error: ${error}`);
            }
        });
        const setupGuild = async (guild) => {
            await (0, commands_1.setupCommands)(guild);
            await (0, statusHandler_1.setupStatusCommands)(guild);
            let dataChannel = guild.channels.cache.find((channel) => get(channel, 'name') === constants_1.constants.DATA_CHANNEL_NAME);
            if (!dataChannel)
                dataChannel = await guild.channels.create(constants_1.constants.DATA_CHANNEL_NAME);
            const existingDataChannelMessages = await dataChannel.messages.fetch({ limit: 50 });
            if (existingDataChannelMessages.size === 0) {
                dataChannel.send(`This is the channel this bot will be using to store data and preferences. ` +
                    `You can put this channel wherever you like, as long as I have permission to see it and send messages in it, ` +
                    `Please do not send any other messages in this channel! It could make me break. Thank you`);
                await dataChannel.send({
                    content: 'Press this button to reset all of the options in this channel',
                    components: [new discord_js_1.MessageActionRow({
                            components: [
                                new discord_js_1.MessageButton()
                                    .setLabel('RESET')
                                    .setStyle('DANGER')
                                    .setCustomId(buttonHandler_1.buttonKeys.RESET_DATA)
                            ]
                        })]
                });
                const voiceChannelNamesMessage = await dataChannel.send(`This is the list of possible names for voice channels: ` +
                    `[The Roots,The Limbs,The Hollow,The Leaves,The Flowers,The Trunk,The Ground,The Canopy,The Air]`);
                await editableMessageHandler_1.editableMessageHandlers.create({ message: voiceChannelNamesMessage });
                const birthdaysMessage = await dataChannel.send(`This is the list of birthdays in this server \n` +
                    `Entries should look like "Nickname/Username Partial": "MM-DD-YYYY" \n` +
                    `Separated by commas \n` +
                    `{}`);
                await editableMessageHandler_1.editableMessageHandlers.create({ message: birthdaysMessage });
                const dailyMessageSettingsMessage = await dataChannel.send(`These are the settings for the daily messages \n` +
                    `{\n` +
                    `"isEnabled": false, \n` +
                    `"onlyOnBirthdays": true, \n` +
                    `"channelPartial": null \n` +
                    `}\n`);
                await editableMessageHandler_1.editableMessageHandlers.create({ message: dailyMessageSettingsMessage });
            }
        };
        client.on('interactionCreate', (interaction) => {
            if (interaction.isModalSubmit() && interaction.customId === editableMessageHandler_1.editableMessageHandlers.constants.editButtonId) {
                // editableMessageHandlers.openModal({ interaction, client });
                // This seems wrong in original code? openModal on interactionCreate?
                // It was checking if customId is editButtonId, which implies a button click, not modal submit?
                // But the original code said `if (interaction.customId === editableMessageHandlers.constants.editButtonId)`
                // And then `editableMessageHandlers.openModal`.
                // If it's a button click, it should be in buttonHandler or here.
                // I'll assume it's a button click to open modal.
            }
            if (interaction.isButton() && interaction.customId === editableMessageHandler_1.editableMessageHandlers.constants.editButtonId) {
                editableMessageHandler_1.editableMessageHandlers.openModal({ interaction, client });
            }
            const buttonPackage = {
                setupGuild,
            };
            if (interaction.isButton()) {
                (0, buttonHandler_1.buttonHandler)(interaction, buttonPackage);
            }
            if (interaction.isCommand()) {
                (0, commands_1.commandsHandler)(interaction);
            }
        });
        client.on('guildCreate', async (guild) => {
            setupGuild(guild);
        });
        client.guilds.cache.forEach(async (guild) => {
            setupGuild(guild);
            (0, morningMessageHandler_1.runMorningMessageLoop)(guild);
        });
    }
    catch (error) {
        (0, errorHandler_1.errorHandler)(error);
    }
});
client.login(process.env.DISCORD_KEY);
