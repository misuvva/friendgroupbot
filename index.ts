/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv';
dotenv.config();
import _ from 'lodash';
import {
  Client, Intents, MessageActionRow, MessageButton, Message, Guild, TextChannel, ThreadChannel, PartialMessage
} from 'discord.js';
const discordModals = require('discord-modals');

// Handlers - assuming these will be migrated to TS or are compatible JS
import { createButton } from './handlers/reminderHandler/reminderHandler';
import { dmHandler } from './handlers/dmHandler/dmHandler';
import { editableMessageHandlers } from './handlers/editableMessageHandler/editableMessageHandler';
import { setupStatusCommands } from './handlers/statusHandler/statusHandler';
import { errorHandler } from './handlers/errorHandler/errorHandler';
import { updateVoiceChats } from './handlers/voiceChatHandler/voiceChatHandler';
import { pick } from './utils/utils';
import { setupCommands, commandsHandler } from './commands';
import { Oauth2Server } from './server';
import { buttonKeys, buttonHandler } from './handlers/buttonHandler';
import { constants } from './utils/constants';
import { runMorningMessageLoop } from './handlers/morningMessageHandler/morningMessageHandler';

// invite link https://discord.com/oauth2/authorize?client_id=1111063850561843303&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A53134&response_type=code&scope=applications.commands%20bot

Oauth2Server();

const intents = new Intents();
intents.add([Intents.FLAGS.DIRECT_MESSAGES]);

const client = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ['CHANNEL', 'MESSAGE', 'REACTION', 'USER', 'GUILD_MEMBER', 'GUILD_SCHEDULED_EVENT']
});
const { get } = _;

discordModals(client);

client.once('ready', async () => {
  try {
    const updateCachedMessages = async (guild: Guild) => {
      try {
        const promises = guild.channels.cache.map(async (guildChannel) => {
          if (get(guildChannel, 'parent.name') !== 'archive' && guildChannel.type === 'GUILD_TEXT') {
            (guildChannel as TextChannel).messages.fetch({ limit: 100 });
          }
        });
        await Promise.all(promises);
      } catch (error) {
        errorHandler(error);
      }
    };

    const messageHandler = async (message: Message | PartialMessage) => {

      if (message.partial) {
        try {
          await message.fetch();
        } catch (error) {
          console.error('Something went wrong when fetching the message: ', error);
          return;
        }
      }
      const fullMessage = message as Message;
      const { guild } = fullMessage;
      try {
        if (!fullMessage.author.bot && guild) {
          updateCachedMessages(guild);
          if (get(fullMessage, 'channel.type') === 'DM') {
            dmHandler(fullMessage, guild);
          } else if (get(fullMessage, 'channel.name')?.includes('announcements')) {
            const hasChannelMentions = get(fullMessage, 'mentions.channels.size') > 0;
            const includesAtOrChannel = fullMessage.mentions.everyone || hasChannelMentions;
            if (!includesAtOrChannel) {
              fullMessage.member?.send(
                `Hey, your message in #announcements in ${guild.name} was deleted because it ` +
                `didnt include an @everyone or a channel mention. If you meant to reply to a previous announcement, ` +
                `please do so in the channel linked by that announcement. Just in case, ` +
                `you said: ${get(fullMessage, 'content')} `
              );
              await fullMessage.delete();
            } else {
              let threadNameArray = [];
              const threadNameLength = pick([3, 4, 5]);
              for (let i = 0; i < threadNameLength; i++) {
                threadNameArray.push(pick(fullMessage.content.split(' ')));
              }
              const threadName = threadNameArray
                .join(' ')
                .replace(/[^a-zA-Z\d\s]/, pick(['x', 'U', 'L', 'hhh', 'm']));
              fullMessage.startThread({ name: threadName });
            }
          } else if (get(fullMessage, 'channel.name') === constants.DATA_CHANNEL_NAME) {
            fullMessage.delete();
          }
        }
      } catch (error) {
        errorHandler(error);
      }
    };

    client.on('messageCreate', messageHandler);

    client.on('voiceStateUpdate', (oldState, newState) => {
      const { guild } = oldState;
      try {
        updateVoiceChats(oldState, newState, guild);
      } catch (error) {
        errorHandler(error);
      }
    });

    client.on('modalSubmit', (modal: any) => {
      if (modal.customId === editableMessageHandlers.constants.editModalId) {
        editableMessageHandlers.modalSubmit({ modal });
      }
    });

    const isCatalogMessage = async (message: Message) => (
      message.content.includes('catalog')
      && message.author.id === client.user?.id
      && (message.channel as TextChannel).name.includes('catalog')
    );

    const getRoleFromCatalog = (messageReaction: any, message: Message) => {
      const games = message.content.split('\n').slice(1);
      const game = games.find(game => game.includes(messageReaction.emoji.name));
      if (!game) return null;
      const roleMention = game.split(' ')[3];
      const roleId = roleMention.slice(3, -1);
      const role = message.guild?.roles.cache.find((role) => role.id === roleId);
      return role;
    };

    client.on('messageReactionAdd', async (messageReaction, user) => {
      const { channel } = messageReaction.message;
      const message = (await channel.messages.fetch(messageReaction.message.id));
      if (await isCatalogMessage(message)) {
        if (message.content.includes(messageReaction.emoji.name!)) {
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
        if (message.content.includes(messageReaction.emoji.name!)) {
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
        if (!generalChannnel || !generalChannnel.isText()) return;
        const owner = await thread.fetchOwner();
        if (!owner || !owner.user) return;
        const ownerName = owner.guildMember?.displayName || owner.user.username;
        const starterMessage = await thread.fetchStarterMessage();
        if (!starterMessage) return;
        await thread.setAutoArchiveDuration(1440);
        const joinThreadButton = {
          content: `Press this button to join this thread`,
          components: [
            new MessageActionRow({
              components: [
                createButton({
                  label: 'Join Thread',
                  style: 'PRIMARY',
                  customId: `join-thread-${thread.id}`,
                  onPress: async (interaction: any) => {
                    await thread.members.add(interaction.member);
                    interaction.reply({ ephemeral: true, content: 'Added!' });
                  }
                })
              ]
            })
          ]
        };
        thread.send(joinThreadButton);
        if (owner.user.bot) return;
        generalChannnel.send({
          content:
            `**${ownerName}** just created a thread in ${thread.parent}`
            + ` on *"${starterMessage.content.replace('@', '@-')}"*`
            + ` called: ${thread}`,
          components: [
            new MessageActionRow({
              components: [
                createButton({
                  label: 'Join Thread',
                  style: 'PRIMARY',
                  customId: `join-thread-${thread.id}`,
                  onPress: async (interaction: any) => {
                    thread.members.add(interaction.member);
                    interaction.reply({ ephemeral: true, content: 'Added!' });
                  }
                })
              ]
            })
          ]
        });
      } catch (error) {
        throw Error(`onThreadCreate Error: ${error}`);
      }
    });

    const setupGuild = async (guild: Guild) => {
      await setupCommands(guild);
      await setupStatusCommands(guild);
      let dataChannel = guild.channels.cache.find((channel) => get(channel, 'name') === constants.DATA_CHANNEL_NAME) as TextChannel;
      if (!dataChannel) dataChannel = await guild.channels.create(constants.DATA_CHANNEL_NAME) as TextChannel;
      const existingDataChannelMessages = await dataChannel.messages.fetch({ limit: 50 });
      if (existingDataChannelMessages.size === 0) {
        dataChannel.send(
          `This is the channel this bot will be using to store data and preferences. ` +
          `You can put this channel wherever you like, as long as I have permission to see it and send messages in it, ` +
          `Please do not send any other messages in this channel! It could make me break. Thank you`
        );
        await dataChannel.send({
          content: 'Press this button to reset all of the options in this channel',
          components: [new MessageActionRow({
            components: [
              new MessageButton()
                .setLabel('RESET')
                .setStyle('DANGER')
                .setCustomId(buttonKeys.RESET_DATA)
            ]
          })]
        });
        const voiceChannelNamesMessage = await dataChannel.send(
          `This is the list of possible names for voice channels: ` +
          `[The Roots,The Limbs,The Hollow,The Leaves,The Flowers,The Trunk,The Ground,The Canopy,The Air]`
        );
        await editableMessageHandlers.create({ message: voiceChannelNamesMessage });
        const birthdaysMessage = await dataChannel.send(
          `This is the list of birthdays in this server \n` +
          `Entries should look like "Nickname/Username Partial": "MM-DD-YYYY" \n` +
          `Separated by commas \n` +
          `{}`
        );
        await editableMessageHandlers.create({ message: birthdaysMessage });
        const dailyMessageSettingsMessage = await dataChannel.send(
          `These are the settings for the daily messages \n` +
          `{\n` +
          `"isEnabled": false, \n` +
          `"onlyOnBirthdays": true, \n` +
          `"channelPartial": null \n` +
          `}\n`,
        );
        await editableMessageHandlers.create({ message: dailyMessageSettingsMessage });
      }
    };

    client.on('interactionCreate', (interaction) => {
      if (interaction.isModalSubmit() && interaction.customId === editableMessageHandlers.constants.editButtonId) {
        // editableMessageHandlers.openModal({ interaction, client });
        // This seems wrong in original code? openModal on interactionCreate?
        // It was checking if customId is editButtonId, which implies a button click, not modal submit?
        // But the original code said `if (interaction.customId === editableMessageHandlers.constants.editButtonId)`
        // And then `editableMessageHandlers.openModal`.
        // If it's a button click, it should be in buttonHandler or here.
        // I'll assume it's a button click to open modal.
      }

      if (interaction.isButton() && interaction.customId === editableMessageHandlers.constants.editButtonId) {
        editableMessageHandlers.openModal({ interaction, client });
      }

      const buttonPackage = {
        setupGuild,
      };
      if (interaction.isButton()) {
        buttonHandler(interaction, buttonPackage);
      }
      if (interaction.isCommand()) {
        commandsHandler(interaction);
      }
    });

    client.on('guildCreate', async (guild) => {
      setupGuild(guild);
    });

    client.guilds.cache.forEach(async (guild) => {
      setupGuild(guild);
      runMorningMessageLoop(guild);
    });

  } catch (error) {
    errorHandler(error);
  }
});

client.login(process.env.DISCORD_KEY);
