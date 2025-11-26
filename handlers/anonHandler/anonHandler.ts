import { Guild, CommandInteraction, TextChannel } from 'discord.js';
// @ts-ignore
import { createCommand } from '../../commands';
// @ts-ignore
import { getPseudonym } from '../dmHandler/utils';

export const setupAnonCommands = (guild: Guild) => {
  createCommand(guild, {
    name: 'say',
    description: 'say something anonymously',
    execute: async (interaction: CommandInteraction) => {
      await interaction.reply({ ephemeral: true, content: 'said anonymously!' });
      const commandContent = interaction.options.getString('what');
      const pseudonym = getPseudonym(guild, interaction.member!.user.id);
      if (interaction.channel instanceof TextChannel) {
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
