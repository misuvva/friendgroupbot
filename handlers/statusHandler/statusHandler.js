const { createCommand } = require('../../commands');

const toggleRoleHandlers = {};

const statuses = [{
  name: 'rip',
  roleName: 'Inebriated',
  onText: 'inebriated (this role will last until the end of the day)',
  offText: 'sober',
  channelName: 'robot-party',
  description: 'gives you the Inebriated role and icon next to your name',
},
{
  name: 'tired',
  roleName: 'Sleep Deprived',
  onText: 'sleep deprived (this role will last until the end of the day)',
  offText: 'well-rested',
  channelName: 'robot-party',
  description: 'gives you the Sleep Deprived role and icon next to your name',
},
{
  name: 'stim',
  roleName: 'Overstimulated',
  onText: 'overstimulated (this role will last until the end of the day)',
  offText: 'not overstimulated',
  channelName: 'robot-party',
  description: 'gives you the Overstimulated role and icon next to your name',
},
{
  name: 'sad',
  roleName: 'Low Feelings',
  onText: 'is having low feelings (this role will last until the end of the day)',
  offText: 'feeling better',
  channelName: 'robot-party',
  description: 'gives you the Low Feelings role and icon next to your name',
},
{
  name: 'stress',
  roleName: 'Stressed',
  onText: 'is stressed out',
  offText: 'feeling better',
  channelName: 'robot-party',
  description: 'gives you the Stressed role and icon next to your name',
},
{
  name: 'prod',
  roleName: 'Productivity',
  onText: 'trying to be productive (this role will last until the end of the day)',
  offText: 'not trying to be productive',
  channelName: 'robot-party',
  description: 'gives you the Productivity role and icon next to your name',
}];

const generateToggleRoleHandler = ({
  guild, name, roleName, onText, offText, channelName, description
}) => {
  const handler = async (interaction) => {
    let { member } = interaction;
    await member.fetch({ force: true });
    const inebriatedRole = guild.roles.cache.find((role) => role.name === roleName);
    const robotParty = guild.channels.cache.find((channel) => channel.name.includes(channelName));
    const userHasRole = !!interaction.member.roles.cache.find((role) => role.name === roleName);
    if (userHasRole) {
      interaction.member.roles.remove(inebriatedRole);
      robotParty.send(`${interaction.member} is ${offText}`);
      interaction.reply({ content: `you are now ${offText}!`, ephemeral: true });
    } else {
      interaction.member.roles.add(inebriatedRole);
      robotParty.send(`${interaction.member} is ${onText}`);
      interaction.reply({ content: `you are now ${onText}!`, ephemeral: true });
    }
  };
  createCommand(guild, { name, description, execute: handler });
  toggleRoleHandlers[`-${name}`] = handler;
};

const clearStatuses = (guild) => {
  const clearRole = (roleName) => {
    const inebriatedRole = guild.roles.cache.find((role) => role.name === roleName);
    guild.members.cache.forEach((member) => {
      if (member.roles[inebriatedRole.id]) member.roles.remove(inebriatedRole);
    });
  };
  statuses.forEach((status) => {
    clearRole(status.roleName);
  });
};

const statusHandler = (message, guild) => {
  if (toggleRoleHandlers[message.content]) {
    toggleRoleHandlers[message.content](message, guild);
  }
};

const setupStatusCommands = (guild) => {
  statuses.forEach((status) => {
    generateToggleRoleHandler({ ...status, guild });
  });
};

module.exports = {
  clearStatuses,
  statusHandler,
  setupStatusCommands
};