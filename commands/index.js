const { generateRelationship } = require('../generators/relationshipGenerator');

const commands = {};

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