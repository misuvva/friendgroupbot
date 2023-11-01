/* eslint-disable quotes */
const { generateRelationship } = require('../generators/relationshipGenerator');
const { pick } = require('../utils/utils');

const pickColor = () => pick([
  '#de2316',
  '#f09841',
  '#e0d316',
  '#ace334',
  '#5ab013',
  '#187818',
  '#329955',
  '#5ed6b2',
  '#5ecad6',
  '#309bf2',
]);

const commands = {};

const isEmoji = (string) => /\p{Emoji}/u.test(string);

const createCommand = async (guild, { name, execute, ...commandArgs }) => {
  try {
    const { commands: guildCommands } = guild;
    commands[name] = execute;
    await guildCommands.create({
      name,
      ...commandArgs
    });
  } catch (error) {
    console.error(error);
  }
};

const setupCommands = async (guild) => {
  await createCommand(guild, {
    name: 'generate-relationship',
    description: 'generates a relationship for you',
    execute: (interaction) => {
      interaction.reply(generateRelationship());
    }
  });
  await createCommand(guild, {
    name: 'add-game',
    description: 'Makes a channel and role for a game, and adds it to the catalog',
    execute: async (interaction) => {
      const { guild } = interaction;
      // make sure guild has a games category and a catalog channel
      const selfId = guild.client.user.id;
      const catalogChannel = guild.channels.cache.find((channel) => channel.name.includes('catalog'));
      const gamesCategory = guild.channels.cache.find((channel) => channel.name.includes('games') && channel.type === 'GUILD_CATEGORY');
      if (!(catalogChannel && gamesCategory)) {
        return interaction.reply(
          `Cannot make the game, make sure that this server has a category that `
          + `includes the word "game" and a channel that includes the word "catalog"`
        );
      }
      const emoji = interaction.options.getString('emoji');
      const channelName = interaction.options.getString('channelname');
      const roleName = interaction.options.getString('rolename');
      const catalogMessages = await catalogChannel.messages.fetch();
      let catalogMessage = catalogMessages.find((message) => message.author.bot && message.content.includes('catalog'));
      if (!catalogMessage) {
        catalogMessage = await catalogChannel.send(
          `This is the catalog of games we have in this server, react with an emoji to be added to the role for that game:`
        );
      }

      try {
        await catalogMessage.react(emoji);
      } catch (e) {
        console.error(e);
        interaction.reply({ content: 'It didnt work. The emoji has to be something I can react to a message with', ephemeral: true });
      }

      const gameRole = await guild.roles.create({ name: roleName, color: pickColor() });
      const gameChannel = await guild.channels.create(`${emoji}${channelName}${emoji}`, { parent: gamesCategory });

      await catalogMessage.edit(
        `${catalogMessage.content}`
        + `\n ${emoji} ${gameChannel} ${gameRole}`
      );

      interaction.reply({ content: 'Done!', ephemeral: true });

    },
    options: [
      {
        name: 'rolename',
        description: 'The name of the role for the game',
        type: 3,
        required: true
      },
      {
        name: 'channelname',
        description: 'The name of the channel for the game',
        type: 3,
        required: true
      },
      {
        name: 'emoji',
        description: 'The Emoji that will represent this game, it cant be one of those fancy server specific emojis',
        type: 3,
        required: true
      }
    ]
  });
};

const commandsHandler = (interaction) => {
  console.log(interaction.commandName, commands, 'DEVLOG'); // RMBL
  if (!interaction.isCommand()) return;
  if (commands[interaction.commandName]) commands[interaction.commandName](interaction);
};

module.exports = {
  commands,
  createCommand,
  setupCommands,
  commandsHandler
};