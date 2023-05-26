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
  Client, Intents, MessageActionRow
} = require('discord.js');
const discordModals = require('discord-modals');
const { DateTime } = require('luxon');

const express = require('express');
const { request } = require('undici');
const {
  reminderHandler,
  remindersMinuteLoop,
  reminderInteractionsHandler,
  createButton
} = require('./handlers/reminderHandler/reminderHandler');
const { youtubeEmbedHandler } = require('./handlers/youtubeEmbedHandler');
const { dmHandler } = require('./handlers/dmHandler/dmHandler');
const { editableMessageHandlers } = require('./handlers/editableMessageHandler/editableMessageHandler');
const { setupFlashCardCommands } = require('./handlers/sheetsHandler/sheetsHandler');
const { statusHandler, setupStatusCommands } = require('./handlers/statusHandler/statusHandler');
const { morningMessageHandler, setupMorningMessageCommands } = require('./handlers/morningMessageHandler/morningMessageHandler');
const { errorHandler } = require('./handlers/errorHandler/errorHandler');
const { updateVoiceChats, setupVoiceChannelCommands } = require('./handlers/voiceChatHandler/voiceChatHandler');
const { pick, getHearts } = require('./utils/utils');
const { generateRelationship } = require('./generators/relationshipGenerator');
const { voteHandler } = require('./handlers/voteHandler/voteHandler');
const { tarotHandler, setupTarotHandlerCommands } = require('./handlers/tarotHandler/tarotHandler');
const { setupCommands, commandsHandler } = require('./commands');
const { setupAnonCommands } = require('./handlers/anonHandler/anonHandler');
const { Oauth2Server } = require('./server');

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

const oneHourInMilliseconds = 1000 * 60 * 60;

const hourlyLoop = async (channel, guild) => {
  try {
    const now = DateTime.now().setZone('UTC-7');
    if (now.hour === 3) {
      await morningMessageHandler(now, guild, channel);
    }
  } catch (error) {
    errorHandler(error);
  }
};

const minuteLoop = async (guild) => {
  await remindersMinuteLoop(guild);
};

client.once('ready', async () => {
  try {
    const guild = client.guilds.cache.first();
    console.log({ guild }, 'DEVLOG'); // RMBL
    client.guilds.cache.forEach(async (guild) => {
      // await setupMorningMessageCommands(guild);
      // await setupVoiceChannelCommands(guild);
      // setupFlashCardCommands(guild);
      const updateCachedMessages = async () => {
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
      await updateCachedMessages();

      // const dailyMessageChannel = guild.channels.cache.find((channel) => channel.name.includes('big-general-2'));
      // const robotParty = guild.channels.cache.find((channel) => channel.name.includes('robot-party'));
      // hourlyLoop(dailyMessageChannel, guild);
      // setInterval(() => hourlyLoop(dailyMessageChannel, guild), oneHourInMilliseconds);
      setInterval(() => minuteLoop(guild), 1000 * 60);

      client.on('modalSubmit', (modal) => {
        if (modal.customId === editableMessageHandlers.constants.editModalId) {
          editableMessageHandlers.modalSubmit({ modal });
        }
      });

      client.on('interactionCreate', (interaction) => {
        if (interaction.customId === editableMessageHandlers.constants.editButtonId) {
          editableMessageHandlers.openModal({ interaction, client });
        }
        reminderInteractionsHandler(interaction);
        commandsHandler(interaction);
      });

      const replyHandler = async (message) => {
        try {
          const reference = await message.fetchReference();
          if (reference) {
            if (reference.content.split(' ')[0] === '-editable') {
              editableMessageHandlers.reply({ message: reference });
            }
          }
        } catch (error) {
          errorHandler(error, message.reply);
        }
      };

      const messageHandler = async (message) => {
        try {
          if (!message.author.bot) {
            updateCachedMessages();
            if (get(message, 'channel.type') === 'DM') {
              dmHandler(message, guild);
            } else {
              if (get(message, 'channel.name').includes('proposals')) {
                await message.react('👍');
                await setTimeout(() => {}, 1000);
                await message.react('🤷');
                await setTimeout(() => {}, 1000);
                await message.react('👎');
              }
              if (get(message, 'channel.name').includes('announcements')) {
                const hasChannelMentions = get(message, 'mentions.channels.size') > 0;
                const includesAtOrChannel = get(message, 'mentions.everyone') || hasChannelMentions;
                if (!includesAtOrChannel) {
                  message.member.send('Hey, your message in #announcements was deleted because it didnt include an @everyone or a channel mention. If you meant to reply to a previous announcement, please do so in the channel linked by that announcement');
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
              }
              if (message.content.split(' ')[0] === '-editable') {
                editableMessageHandlers.create({ message });
              }
              if (message.type === 'REPLY') {
                replyHandler(message);
              }
              if (message.content === '-passFail' || message.content.split(' ')[0] === '-passFail') {
                voteHandler(message, guild);
              }
              if (message.embeds.find((embed) => embed.provider.name === 'YouTube')) {
                message.embeds.forEach((embed) => {
                  if (embed.provider.name === 'YouTube') {
                    youtubeEmbedHandler(message, embed);
                  }
                });
              }
              statusHandler(message, guild);
            }
          }
        } catch (error) {
          errorHandler(error);
        }
      };

      client.on('messageCreate', messageHandler);

      client.on('voiceStateUpdate', (oldState, newState) => {
        try {
          updateVoiceChats(oldState, newState, guild);
        } catch (error) {
          errorHandler(error);
        }
      });

      // client.on('messageReactionAdd', (messageReaction, user) => {
      //   try {
      //     const reminderEmojis = ['📌', '⏲️', '☄️'];
      //     if (reminderEmojis.includes(messageReaction.emoji.name)) {
      //       reminderHandler(messageReaction, user);
      //     }
      //   } catch (error) {
      //     errorHandler(error);
      //   }
      // });

      client.on('threadCreate', async (thread) => {
        try {
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
          // robotParty.send({
          //   content:
          //     `**${ownerName}** just created a thread in ${thread.parent}`
          //     + ` on *"${starterMessage.content.replace('@', '@-')}"*`
          //     + ` called: ${thread}`,
          //   components: [
          //     new MessageActionRow({
          //       components: [
          //         createButton({
          //           label: 'Join Thread',
          //           style: 'PRIMARY',
          //           customId: `join-thread-${thread.id}`,
          //           onPress: async (interaction) => {
          //             thread.members.add(interaction.member);
          //             interaction.reply({ ephemeral: true, content: 'Added!' });
          //           }
          //         })
          //       ]
          //     })
          //   ]
          // });
        } catch (error) {
          throw Error(`onThreadCreate Error: ${error}`);
        }
      });

      setupCommands(guild);
      // setupTarotHandlerCommands(guild);
      setupStatusCommands(guild);
      // setupAnonCommands(guild);

    });
  } catch (error) {
    errorHandler(error);
  }
});

client.login(process.env.DISCORD_KEY);
