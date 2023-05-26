/* eslint-disable consistent-return */
const moment = require('moment');
const { namesToHandles, generateAnonId } = require('./utils');
const { getStore, addToStore } = require('../../storeUtils/storeUtils');
const { errorHandler } = require('../errorHandler/errorHandler');

const anonCodesPath = 'anonCodes';

const storeAnonCode = async (code, userId) => {
  await addToStore(`${anonCodesPath}.${code}`, userId);
};

const getAnonCodes = async () => {
  const store = await getStore();
  return store[anonCodesPath] || {};
};

const helpText = `.
**- You can say, "say x", and I'll say it in big general for you** \n (also if you precede your message with a specific channel name I'll send it there instead)
**- Say "Send person x", and I'll dm them for you.**
(*It's gotta be their nickname in the server, if u mispell it I'm not gonna try to guess who ur talking about, \
I'm a computer. don't worry though you don't have to type the dots, I'm ignoring the dots. unless you know any weird motherfuckers with names that DON'T have dots in it, \
if that's happening please put a stop to it. Also, I'm just reading x as I see it and sending them that exactly, so u can just make the grammar make sense on your end, idk \
how that shit works bc I'm a computer. Beep Boop*) 
**- Say "Tell person x"** and it'll do the same thing but with a randomly generated pseudonym
**- Say "Ask person x"** and I'll send them a question anonymously that they can respond to publicly
**- Say "Answer *anoncode* x"** to answer an anonymous question
`;

const dmHandler = async (message, guild) => {
  try {
    const bigGeneral = guild.channels.cache.find((channel) => channel.name.includes('big-general'));

    // Names in the server are formatted with 2 chars of padding on each side
    // TODO: this doesn't work with compound names like basil/ella and darwin/percy
    const getName = (member) => member.nickname.slice(2, -2)
      .toLowerCase()
      .split(' ')
      .join('');

    const people = guild.members.cache
      .filter((member) => !member.user.bot)
      .map((member) => ({ [getName(member)]: member }))
      .reduce((a, b) => ({ ...a, ...b }));

    const anonCodes = await getAnonCodes();

    const senderName = Object.keys(people).find((name) => people[name].user.id === message.author.id);

    const names = Object.keys(people).sort();
    const handles = namesToHandles(names, senderName);

    const text = message.content;
    const words = text.split(' ');

    const findMessageWithAnonId = async (id) => {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const result = messages.find((message) => message.content.split(' ')[0].slice(1, -1) === id);
      return result;
    };

    const getPerson = (identifier) => {
      // An identifier can be an anon code, a name, or a handle
      const isAnonCode = Object.keys(anonCodes).includes(identifier.toUpperCase());
      const isName = Object.keys(people).includes(identifier);
      const isHandle = Object.values(handles).includes(identifier);
      let name;
      let person;
      if (isName) {
        name = identifier;
        person = people[name];
      } else if (isHandle) {
        const handle = identifier;
        name = Object.keys(handles).find((name) => handles[name] === handle);
        person = people[name];
      } else if (isAnonCode) {
        const { userId } = anonCodes[identifier.toUpperCase()];
        [name, person] = Object.entries(people).find(([, member]) => member.user.id === userId);
      }
      return { name, person };
    };

    const tellHandler = async ({ isAnon = true }) => {
      if (words.length === 1) {
        return message.reply({ content: 'tell who what? u gotta say the whole thing at once, idk how to remember things yet' });
      }

      // the address could be a name, or a nickname, or an anonymous message code
      const address = words[1].toLowerCase();
      const isName = Object.keys(people).includes(address);
      const isHandle = Object.values(handles).includes(address);
      const isAnonCode = Object.keys(anonCodes).includes(address.toUpperCase());

      if ((isName || isHandle || isAnonCode)) {
        if (words.length < 3) {
          // Validation to make sure the command is in the correct format
          return message.reply({ content: `wait, tell ${address} what? u gotta say the whole thing at once, idk how to remember things yet` });
        }
        const content = words.slice(2).join(' ');
        const { person: sendee } = await getPerson(address);

        // user pseudonyms are based both the sender and the recipient
        const senderHandlesFromSendeePerspective = namesToHandles(names, address);
        const senderHandleFromSendeePerspective = senderHandlesFromSendeePerspective[senderName];

        // anon codes need to be found in the store, since the process to make them isn't reversible like the pseudonyms
        if (isAnon) {
          const anonId = generateAnonId();
          await sendee.send({ content: `\`${anonId}\` said: ${content}` });
          storeAnonCode(anonId, { userId: message.author.id, updatedAt: moment().toISOString() });
        } else {
          sendee.send({ content: `${senderHandleFromSendeePerspective}: ${content}` });
        }
        message.reply({ content: 'gotcha' });
      } else {
        const result = `idk who "${address}" is, here's the list of people u can dm, just in case: \n\
${[...Object.keys(people)].sort().join(', ')}\n\n${[...Object.values(handles)].sort().join(', ')}`;
        message.reply({ content: result });
      }
    };

    switch (words[0].toLowerCase()) {
      case 'say':
        {
          let content;
          let channelToSendIn = bigGeneral;
          if (words[1][0] === '#') {
            // Using includes instead of === because many of the channel names have emojis
            const channel = guild.channels.cache.find((channel) => channel.name.includes(words[1].toLowerCase().slice(1)));
            if (channel && channel.type === 'GUILD_TEXT' && channel.parent.name.toLowerCase() !== 'archive') {
              content = words.slice(2).join(' ');
              channelToSendIn = channel;
            } else {
              return message.reply({ content: 'when the first word of your message starts with a #, it makes me think youre trying to send to a specific channel name, but I dont recognize that one' });
            }
          } else {
            content = words.slice(1).join(' ');
          }
          const saidMessage = await channelToSendIn.send({ content: `> ${content}` });
          message.reply({ content: saidMessage.url });
        }
        break;
      case 'tell':
        return tellHandler({ isAnon: false });
      case 'send':
        return tellHandler({ isAnon: true });
      case 'huh?':
        message.reply({ content: helpText });
        break;
      case 'ask':
        {
          const sendeeNameOrHandle = words[1].toLowerCase();
          const result = getPerson(sendeeNameOrHandle);
          const sendee = result.person;
          const content = words.slice(2).join(' ');

          // anon id is based on message content and sender;
          const anonMessageId = generateAnonId();
          sendee.send({ content: `\`${anonMessageId}\` asked you: "${content}"` });
          message.reply({ content: 'gotcha' });
        }
        break;
      case 'answer':
        {
          // "ask" command is always anonymous and always uses an anonId instead of a pseudonym
          const anonMessageId = words[1].toUpperCase();
          const question = await findMessageWithAnonId(anonMessageId);
          const content = words.slice(2).join(' ');
          if (question) {
            const questionContent = question.content.split(' ').slice(3).join(' ');
            const publicMessage = await bigGeneral.send({ content: `.\n **Anon** asked: ${questionContent} \n **${senderName}**: ${content}` });
            message.reply({ content: `gotcha, ${publicMessage.url}` });
          } else {
            message.reply({ content: 'I couldn\'t find a question with that code' });
          }
        }
        break;
      default:
        message.reply({ content: 'Idk what that is. You can say "huh?" and I\'ll tell u what things you can say' });
    }
  } catch (error) {
    errorHandler(error);
    message.reply({ content: 'I\'m sorry, something has gone wrong, I\'m not feeling well *cough cough* tell mars I\'m broken. He might already know but tell him anyways' });
  }
};

module.exports = {
  dmHandler
};
