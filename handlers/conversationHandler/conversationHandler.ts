/* eslint-disable prefer-template */
/* eslint-disable quotes */
/* eslint-disable arrow-body-style */
/* eslint-disable arrow-parens */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
import _ from 'lodash';
import { MessageEmbed, Guild, TextChannel, Message, Collection, GuildMember, ThreadChannel } from 'discord.js';
import { getHeart } from '../../utils/utils';

const conversationBreakThreshold = 1000 * 60 * 60 * 3;

const findConversationBreak = (messagesParam: Collection<string, Message>): Message[] | undefined => {
  const messages = [...messagesParam.values()];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const messageBefore = messages[i + 1];
    if (messageBefore) {
      const timeDifference = message.createdTimestamp - messageBefore.createdTimestamp;
      if (timeDifference > conversationBreakThreshold) {
        return messages.slice(0, i + 1);
      }
    }
  }
};

interface Conversation {
  firstMessage: Message;
  lastMessage: Message;
  messages: Message[];
  participants: Record<string, GuildMember>;
  channel: TextChannel | ThreadChannel;
}

const findLastConversation = async (channel: TextChannel | ThreadChannel, beforeMessage?: Message): Promise<Conversation> => {
  let lastMessage = beforeMessage;
  let conversationBreakFound = false;
  const messages: Message[] = [];

  while (!conversationBreakFound) {
    const newMessagesFetched = await channel.messages.fetch({ limit: 100, before: lastMessage ? lastMessage.id : undefined });
    if (!newMessagesFetched.first()) {
      break;
    }
    const conversationBreak = findConversationBreak(newMessagesFetched);
    if (conversationBreak) {
      conversationBreak.forEach(message => messages.push(message));
      conversationBreakFound = true;
    } else {
      newMessagesFetched.forEach(message => messages.push(message));
      lastMessage = newMessagesFetched.last();
    }
  }

  const participants: Record<string, GuildMember> = {};
  messages.forEach(message => {
    const memberId = _.get(message, 'member.id');
    if (!memberId) return;
    if (!participants[memberId] && message.member) {
      participants[memberId] = message.member;
    }
  });

  return {
    firstMessage: messages.slice(-1)[0],
    lastMessage: messages[0],
    messages,
    participants,
    channel
  };
};

const displayConversation = async (conversation: Conversation, guild: Guild) => {
  let participantsDisplay = '';
  const participants = Object.values(conversation.participants);
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const heart = await getHeart(guild, participant);
    participantsDisplay += `${heart}`;
  }
  return {
    title: `${conversation.messages.length} in #${conversation.channel.name}`,
    hearts: participantsDisplay
  };
};

const getConversations = async ({ channel, since = 1000 * 60 * 60 * 24 }: { channel: TextChannel | ThreadChannel, since?: number }) => {
  let conversations: Conversation[] = [];
  let lastMessageOfOldestConversation: Message | undefined;
  let firstMessageOfOldestConversation: Message | undefined;
  let numberOfloops = 0;

  const shouldLoop = () => {
    numberOfloops++;
    if (numberOfloops > 10) return false;
    let result;
    if (!lastMessageOfOldestConversation) result = true;
    else {
      const timeSinceLastMessageOfOldestConversation = Date.now() - lastMessageOfOldestConversation.createdAt.getTime();
      if (timeSinceLastMessageOfOldestConversation < since) result = true;
      else result = false;
    }
    return result;
  };

  while (shouldLoop()) {
    const conversation = await findLastConversation(channel, firstMessageOfOldestConversation);
    conversations.push(conversation);
    lastMessageOfOldestConversation = conversation.lastMessage;
    firstMessageOfOldestConversation = conversation.firstMessage;
  }
  return conversations;
};

export const sendConversationUpdate = async (guild: Guild, channel: TextChannel) => {
  // for each text channel (except archived)
  const conversations: Conversation[] = []; // in the last 8 hours that have no
  const exceptedChannels = ['announcements', 'about-the-members', 'server-guide', 'the-law', 'proposals'];
  // const hearts = await getHearts(guild);

  const textChannels = guild.channels.cache.filter((channel) => {
    const isInArchive = !_.get(channel, 'parent.name', '').toLowerCase().includes('archive');
    const isThreadOnRobotParty = _.get(channel, 'parent.name', '').toLowerCase().includes('robot-party');
    const isIncluded = !exceptedChannels.find((channelNameWithoutEmojis) => channel.name.includes(channelNameWithoutEmojis));
    const isTextChannel = [
      'GUILD_TEXT',
      'GUILD_PUBLIC_THREAD',
      'GUILD_PRIVATE_THREAD'
    ].includes(_.get(channel, 'type') as string);
    return isInArchive && isTextChannel && isIncluded && !isThreadOnRobotParty;
  }) as Collection<string, TextChannel | ThreadChannel>;

  const textChannelsWithNewMessages: (TextChannel | ThreadChannel)[] = [];

  await Promise.all(textChannels.map(async channel => {
    const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
    if (!lastMessage) return;
    const threshold = 1000 * 60 * 60 * 24;
    const timeSinceLastMessage = Date.now() - lastMessage.createdTimestamp;
    if (timeSinceLastMessage < threshold) {
      textChannelsWithNewMessages.push(channel);
    }
  }));

  const embeds: MessageEmbed[] = [];

  await Promise.all(textChannelsWithNewMessages.map(async (channel) => {
    const channelConversations = await getConversations({ channel });
    await Promise.all(channelConversations.map(async conversation => {
      if (!(conversation.messages.length > 100)) return;
      conversations.push(conversation);
      const { title, hearts: description } = await displayConversation(conversation, guild);
      embeds.push(new MessageEmbed({
        url: conversation.firstMessage.url,
        title,
        description,
        color: conversation.firstMessage.member?.displayColor
      }));
    }));
  }));
  if (!conversations.length) return;
  channel.send(`There were ${conversations.length} conversations with 100 messages or more:`);
  for (let i = 0; i < embeds.length; i += 10) {
    channel.send({
      content: '.',
      embeds: embeds.slice(i, 10)
    });
  }
};
