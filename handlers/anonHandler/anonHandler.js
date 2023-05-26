const { createCommand } = require('../../commands');
const { getPseudonym } = require('../dmHandler/utils');

const setupAnonCommands = (guild) => {
  createCommand(guild, {
    name: 'say',
    description: 'say something anonymously',
    execute: async (interaction) => {
      await interaction.reply({ ephemeral: true, content: 'said anonymously!' });
      const commandContent = interaction.options.getString('what');
      const pseudonym = getPseudonym(guild, interaction.member.user.id);
      interaction.channel.send({
        content: `***${pseudonym}:*** ${commandContent}`
      });
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

module.exports = {
  setupAnonCommands
};