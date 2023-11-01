/* eslint-disable quotes */
const { generateRelationship } = require('../generators/relationshipGenerator');

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
      const name = interaction.options.getString('name');
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

      // create role, create channel

      return console.log(interaction.options, 'DEVLOG'); // RMBL
    },
    options: [
      {
        name: 'roleName',
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