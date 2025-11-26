/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-template */
import { DateTime } from 'luxon';
import { Guild, Message, TextChannel, User, MessageReaction } from 'discord.js';

const getVoters = async (guild: Guild, atTime: DateTime = DateTime.now()) => {
  const proposalsChannel = guild.channels.cache.find((channel) => channel.name.includes('proposals')) as TextChannel;
  if (!proposalsChannel) return {};
  const lastHundredProposals = await proposalsChannel.messages.fetch({ limit: 100 });
  const voters: Record<string, User> = {};
  const lastThreeMonthsOfProposals = lastHundredProposals.filter((message) => {
    const { createdAt } = message;
    const threeMonthsAgo = atTime.minus({ months: 3 }).toMillis();
    return threeMonthsAgo < createdAt.getTime();
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

const isProposalActive = (proposal: Message, atTime = DateTime.now()) => proposal.createdTimestamp < atTime.minus({ hours: 24 }).toMillis();

const doesProposalPass = async (message: Message, guild: Guild, index = 0) => {
  const proposalsChannel = guild.channels.cache.find((channel) => channel.name.includes('proposals')) as TextChannel;
  if (!proposalsChannel) return;
  const lastHundredProposals = await proposalsChannel.messages.fetch({ limit: 100 });
  const proposalInQuestion = [...lastHundredProposals.values()].sort((a, b) => a.createdTimestamp < b.createdTimestamp ? 1 : -1)[index]; // Corrected sort
  if (!proposalInQuestion) return;
  const isActive = isProposalActive(proposalInQuestion);
  message.reply('Working on it, drumroll please...');
  const atTime = isActive
    ? DateTime.fromJSDate(proposalInQuestion.createdAt)
    : DateTime.fromJSDate(proposalInQuestion.createdAt).plus({ hours: 24 });

  const registeredVoters = await getVoters(guild, atTime as any);
  const yesVotes: Record<string, User> = {};
  const abstentions: Record<string, User> = {};
  const noVotes: Record<string, User> = {};
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

  const names = (collection: Record<string, User>) => Object.values(collection).map((user) => user.username).join(', ');
  const number = (collection: Record<string, User>) => Object.values(collection).length;

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

export const voteHandler = async (message: Message, guild: Guild) => {
  try {
    if (Number(message.content.split(' ')[1])) {
      doesProposalPass(message, guild, Number(message.content.split(' ')[1]));
    } else if (message.content.split(' ')[1]) {
      message.reply('The second argument has to be a number for that to work');
    } else {
      doesProposalPass(message, guild);
    }
  } catch (error: any) {
    message.reply(error.content || error.message);
  }
};
