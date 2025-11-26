/* eslint-disable linebreak-style */
/* eslint-disable prefer-template */
/* eslint-disable no-useless-concat */
/* eslint-disable operator-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable arrow-parens */
/* eslint-disable quotes */
/* eslint-disable no-nested-ternary */
require('dotenv').config();
const _ = require('lodash');
const {
  Client, Intents, MessageActionRow, Message, MessageButton
} = require('discord.js');
const discordModals = require('discord-modals');

const {
  createButton,
} = require('./handlers/reminderHandler/reminderHandler');
const { dmHandler } = require('./handlers/dmHandler/dmHandler');
const { editableMessageHandlers } = require('./handlers/editableMessageHandler/editableMessageHandler');
const { setupStatusCommands } = require('./handlers/statusHandler/statusHandler');
const { errorHandler } = require('./handlers/errorHandler/errorHandler');
const { updateVoiceChats } = require('./handlers/voiceChatHandler/voiceChatHandler');
const { pick } = require('./utils/utils');
const { setupCommands, commandsHandler } = require('./commands');
const { Oauth2Server } = require('./server');
const { buttonKeys, buttonHandler } = require('./handlers/buttonHandler');
const { constants } = require('./utils/constants');
const { runMorningMessageLoop } = require('./handlers/morningMessageHandler/morningMessageHandler');

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
    const updateCachedMessages = async (guild) => {
      try {
        const promises = guild.channels.cache.map(async (guildChannel) => {
          if (get(guildChannel, 'parent.name') !== 'archive' && guildChannel.type === 'GUILD_TEXT') {
            guildChannel.messages.fetch({ limit: 100 });
          }
        });
        await Promise.all(promises);
      } catch (error) {
        errorHandler(error);
      }
    };

    const messageHandler = async (message) => {
      const { guild } = message;
      try {
        if (!message.author.bot) {
          updateCachedMessages(guild);
          if (get(message, 'channel.type') === 'DM') {
            dmHandler(message, guild);
          } else if (get(message, 'channel.name').includes('announcements')) {
            const hasChannelMentions = get(message, 'mentions.channels.size') > 0;
            const includesAtOrChannel = get(message, 'mentions.everyone') || hasChannelMentions;
            if (!includesAtOrChannel) {
              message.member.send(
                `Hey, your message in #announcements in ${guild.name} was deleted because it ` +
                  `didnt include an @everyone or a channel mention. If you meant to reply to a previous announcement, ` +
                  `please do so in the channel linked by that announcement. Just in case, ` +
                  `you said: ${get(message, 'content')} `
              );
              await message.delete();
            } else {
              let threadNameArray = [];
              const threadNameLength = pick([3, 4, 5]);
              for (let i = 0; i < threadNameLength; i++) {
                threadNameArray.push(pick(message.content.split(' ')));
              }
              const threadName = threadNameArray
                .join(' ')
                .replace(/[^a-zA-Z\d\s]/, pick(['x', 'U', 'L', 'hhh', 'm']));
              message.startThread({ name: threadName });
            }
          } else if (get(message, 'channel.name') === constants.DATA_CHANNEL_NAME) {
            message.delete();
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

    client.on('modalSubmit', (modal) => {
      if (modal.customId === editableMessageHandlers.constants.editModalId) {
        editableMessageHandlers.modalSubmit({ modal });
      }
    });

    const isCatalogMessage = async (message) => (
      message.content.includes('catalog')
        && message.author.id === client.user.id
        && message.channel.name.includes('catalog')
    );

    const getRoleFromCatalog = (messageReaction, message) => {
      const games = message.content.split('\n').slice(1);
      const game = games.find(game => game.includes(messageReaction.emoji));
      const roleMention = game.split(' ')[3];
      const roleId = roleMention.slice(3, -1);
      const role = message.guild.roles.cache.find((role) => role.id === roleId);
      return role;
    };

    client.on('messageReactionAdd', async (messageReaction, user) => {
      const { channel } = messageReaction.message;
      const message = (await channel.messages.fetch(messageReaction.message)).first();
      if (await isCatalogMessage(message)) {
        if (message.content.includes(messageReaction.emoji)) {
          const role = await getRoleFromCatalog(messageReaction, message);
          const member = message.guild.members.cache.find(member => member.user.id === user.id);
          await member.roles.add(role);
        }
      }
    });

    client.on('messageReactionRemove', async (messageReaction, user) => {
      const { channel } = messageReaction.message;
      const message = (await channel.messages.fetch(messageReaction.message)).first();
      if (await isCatalogMessage(message)) {
        if (message.content.includes(messageReaction.emoji)) {
          const role = await getRoleFromCatalog(messageReaction, message);
          const member = message.guild.members.cache.find(member => member.user.id === user.id);
          await member.roles.remove(role);
        }
      }
    });

    client.on('threadCreate', async (thread) => {
      try {
        const { guild } = thread;
        const generalChannnel = guild.channels.cache.find(channel => channel.name.includes('general'));
        if (!generalChannnel) return;
        const owner = await thread.fetchOwner();
        const ownerName = owner.guildMember.displayName;
        const starterMessage = await thread.fetchStarterMessage();
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
                  onPress: async (interaction) => {
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

    const setupGuild = async (guild) => {
      await setupCommands(guild);
      await setupStatusCommands(guild);
      let dataChannel = guild.channels.cache.find((channel) => get(channel, 'name') === constants.DATA_CHANNEL_NAME);
      if (!dataChannel) dataChannel = await guild.channels.create(constants.DATA_CHANNEL_NAME);
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
              new MessageButton({
                label: 'RESET',
                style: 'DANGER',
                customId: buttonKeys.RESET_DATA,
              })
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
      if (interaction.customId === editableMessageHandlers.constants.editButtonId) {
        editableMessageHandlers.openModal({ interaction, client });
      }
      const buttonPackage = {
        setupGuild,
      };
      if (interaction.type === 'MESSAGE_COMPONENT') {
        buttonHandler(interaction, buttonPackage);
      }
      commandsHandler(interaction);
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
