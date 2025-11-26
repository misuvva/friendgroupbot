/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
const luxon = require('luxon');

const getVoters = async (guild, atTime = luxon.DateTime.now()) => {
  const proposalsChannel = guild.channels.cache.find((channel) => channel.name.includes('proposals'));
  const lastHundredProposals = await proposalsChannel.messages.fetch({ limit: 100 });
  const voters = {};
  const lastThreeMonthsOfProposals = lastHundredProposals.filter((message) => {
    const { createdAt } = message;
    const threeMonthsAgo = atTime.minus({ months: 3 }).toMillis();
    return threeMonthsAgo < createdAt;
  });
  await Promise.all(lastThreeMonthsOfProposals.map(async (message) => {
    const reactions = message.reactions.cache;
    await Promise.all(reactions.map(async (reaction) => {
      const users = await reaction.users.fetch();
      users.forEach((user) => {
        if (!user.bot) voters[user.id] = user;
      });
    }));
  }));
  return voters;
};

const isProposalActive = (proposal, atTime = luxon.DateTime.now()) => proposal.createdAt < atTime.minus({ hours: 24 }).toMillis();

const doesProposalPass = async (message, guild, index = 0) => {
  const proposalsChannel = guild.channels.cache.find((channel) => channel.name.includes('proposals'));
  const lastHundredProposals = await proposalsChannel.messages.fetch({ limit: 100 });
  const proposalInQuestion = [...lastHundredProposals.values()].sort((a, b) => a.createdAt < b.createdAt)[index];
  if (!proposalInQuestion) return;
  const isActive = isProposalActive(proposalInQuestion);
  message.reply('Working on it, drumroll please...');
  const atTime = isActive
    ? luxon.DateTime.fromJSDate(proposalInQuestion.createdAt)
    : luxon.DateTime.fromJSDate(proposalInQuestion.createdAt).plus({ hours: 24 });

  const registeredVoters = await getVoters(guild, atTime);
  const yesVotes = {};
  const abstentions = {};
  const noVotes = {};
  const reactions = proposalInQuestion.reactions.cache;
  await Promise.all(reactions.map(async (reaction, emoji) => {
    const users = await reaction.users.fetch();
    users.forEach((user) => {
      if (user.bot) return;
      if (emoji === '👎') {
        noVotes[user.id] = user;
      }
      if (emoji === '🤷') {
        abstentions[user.id] = user;
      }
      if (emoji === '👍') {
        yesVotes[user.id] = user;
      }
    });
  }));

  const names = (collection) => Object.values(collection).map((user) => user.username).join(', ');
  const number = (collection) => Object.values(collection).length;

  const majority = Math.floor(((number(registeredVoters) - number(abstentions)) / 2) + 1);
  const doesPass = number(yesVotes) >= majority;
  const passFailText = isActive
    ? doesPass
      ? '**This proposal passed! 🎉🎉🎉**\n\n'
      : '**This proposal did not pass**\n\n'
    : doesPass
      ? '**This proposal will pass! (but hasnt yet) 🎉🎉🎉**\n\n'
      : '**This proposal wont pass just yet (but its not done yet)**\n\n';

  message.reply(
    passFailText
    + proposalInQuestion.url + '\n'
    + `**🌎 Number of total voters: ${number(registeredVoters)}** \n> ${names(registeredVoters)}\n`
    + `**👍 Number of yes votes: ${number(yesVotes)}** \n> ${names(yesVotes)}\n`
    + `**🤷 Number of abstentions: ${number(abstentions)}** \n> ${names(abstentions)}\n`
    + `**👎 Number of no votes: ${number(noVotes)}** \n> ${names(noVotes)}\n`
    + `**The smallest possible majority is: ${majority}**`
  );

};

const voteHandler = async (message, guild) => {
  try {
    if (Number(message.content.split(' ')[1])) {
      doesProposalPass(message, guild, Number(message.content.split(' ')[1]));
    } else if (message.content.split(' ')[1]) {
      message.reply('The second argument has to be a number for that to work');
    } else {
      doesProposalPass(message, guild);
    }
  } catch (error) {
    message.reply(error.content);
  }
};

module.exports = {
  voteHandler
};