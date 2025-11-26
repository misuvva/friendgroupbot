"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMorningMessageLoop = exports.setupMorningMessageCommands = void 0;
exports.morningMessageHandler = morningMessageHandler;
/* eslint-disable prefer-template */
const luxon_1 = require("luxon");
const promises_1 = __importDefault(require("fs/promises"));
const discord_js_1 = require("discord.js");
const getSolarString_1 = require("./getSolarString");
const dataChannelHandler_1 = require("../dataChannelHandler");
const hourInMs = 1000 * 60 * 60;
async function morningMessageHandler(now, guild, channel, dataChannelData) {
    const { dailyMessagesSettings: settings } = dataChannelData;
    const calendarAsJsonString = await promises_1.default.readFile('./calendar.json', { encoding: 'utf8' });
    const calendar = JSON.parse(calendarAsJsonString);
    const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
    const { solar, gregorian } = calendar[dateKeyGregorian];
    const gregorianString = luxon_1.DateTime.fromFormat(gregorian, 'cccc, MMM dd, yyyy').toFormat('cccc, MMMM d, yyyy');
    if (settings.onlyOnBirthdays) {
        const isCurrentOrUpcomingBirthday = await (0, getSolarString_1.getSolarString)(guild, solar, true);
        if (!isCurrentOrUpcomingBirthday)
            return;
    }
    let solarString;
    solarString = await (0, getSolarString_1.getSolarString)(guild, solar);
    const activeThreads = guild.channels.cache
        .filter((channel) => channel.isThread())
        .filter((thread) => !thread.archived); // Force type
    const threadsForThreadsMessage = [];
    const forumPostsForThreadsMessage = [];
    await Promise.all(activeThreads.map(async (thread) => {
        const lastMessage = (await thread.messages.fetch({ limit: 1 })).first();
        if (!lastMessage)
            return;
        const numberOfMillisecondsInADay = 60 * 60 * 24 * 1000;
        const millisecondsSinceLastMessage = Date.now() - lastMessage.createdTimestamp;
        if ((millisecondsSinceLastMessage) <= numberOfMillisecondsInADay) {
            if (thread.parent === null) {
                forumPostsForThreadsMessage.push(thread);
            }
            else if (thread.name !== 'Edit history') {
                threadsForThreadsMessage.push(thread);
            }
        }
    }));
    const makeThreadLine = (separator = '🧵') => (thread, index) => {
        if (index % 1 === 0) {
            return `\n    ${thread}`;
        }
        return ` ${separator} ${thread}`;
    };
    forumPostsForThreadsMessage.sort((a, b) => {
        if (!b.name.includes('['))
            return -1;
        if (!a.name.includes('[')) {
            return 1;
        }
        const aDateString = a.name.split(' ')[0].slice(1, a.name.split(' ')[0].length - 1);
        const bDateString = b.name.split(' ')[0].slice(1, b.name.split(' ')[0].length - 1);
        if (aDateString === bDateString) {
            return 1;
        }
        if (aDateString.includes('?')) {
            return 1;
        }
        if (bDateString.includes('?')) {
            return -1;
        }
        const aDate = luxon_1.DateTime.fromFormat(aDateString, 'M-d');
        const bDate = luxon_1.DateTime.fromFormat(bDateString, 'M-d');
        if (aDate.toMillis() < bDate.toMillis()) {
            return -1;
        }
        return 1;
    });
    const threadsMessage = `\n\n**Active Threads:**${threadsForThreadsMessage.map(makeThreadLine()).join('')}`;
    const eventsMessage = `\n\n**Active Events:**${forumPostsForThreadsMessage.map(makeThreadLine('🎉')).join('')}`;
    const calendarString = 'Good morning! Today is'
        + `\n${solarString}`
        + `\n🇻🇦 *(${gregorianString})*`;
    await channel.send({ content: calendarString });
    if (threadsForThreadsMessage.length) {
        await channel.send({ content: threadsMessage });
    }
    if (forumPostsForThreadsMessage.length) {
        await channel.send({ content: eventsMessage });
    }
}
const setupMorningMessageCommands = async (guild, createCommand) => {
    await createCommand(guild, {
        name: 'send-daily-message',
        description: 'Send the daily morning message in the current channel',
        execute: async (interaction) => {
            const { guild } = interaction;
            if (!guild)
                return;
            const offset = interaction.options.getInteger('offset') || 0;
            const now = luxon_1.DateTime.now().setZone('UTC-7').plus({ days: offset });
            const dataChannelData = await (0, dataChannelHandler_1.getData)(guild);
            if (interaction.channel instanceof discord_js_1.TextChannel) {
                morningMessageHandler(now, guild, interaction.channel, dataChannelData);
            }
            interaction.reply({ content: 'Morning message sent!', ephemeral: true });
        },
        options: [
            {
                name: 'offset',
                description: 'number to add to the day',
                type: 4,
                required: false
            }
        ]
    });
    await createCommand(guild, {
        name: 'send-solar-string',
        description: 'Test command to send the morning message solar calendar text',
        execute: async (interaction) => {
            try {
                const { guild } = interaction;
                if (!guild)
                    return;
                const offset = interaction.options.getInteger('offset') || 0;
                const now = luxon_1.DateTime.now().plus({ days: offset });
                const calendarAsJsonString = await promises_1.default.readFile('./calendar.json', { encoding: 'utf8' });
                const calendar = JSON.parse(calendarAsJsonString);
                const dateKeyGregorian = now.toFormat('MM/dd/yyyy');
                const { solar } = calendar[dateKeyGregorian];
                let solarString = await (0, getSolarString_1.getSolarString)(guild, solar);
                if (typeof solarString === 'string') {
                    interaction.reply({ content: solarString, ephemeral: true });
                }
                else {
                    interaction.reply({ content: 'Could not get solar string', ephemeral: true });
                }
            }
            catch (error) {
                console.error(error);
            }
        },
        options: [
            {
                name: 'offset',
                description: 'number to add to the day',
                type: 4,
                required: false
            }
        ]
    });
};
exports.setupMorningMessageCommands = setupMorningMessageCommands;
const runMorningMessageLoop = async (guild) => {
    const dataChannelData = await (0, dataChannelHandler_1.getData)(guild);
    if (!dataChannelData)
        return;
    const { dailyMessagesSettings: settings } = dataChannelData;
    const inner = () => {
        const channel = guild.channels.cache.find((channel) => channel.name.includes(settings.channelPartial));
        if (channel) {
            const now = luxon_1.DateTime.now().setZone('America/Los_Angeles');
            if (now.hour === 2) {
                morningMessageHandler(now, guild, channel, dataChannelData);
            }
        }
    };
    if (settings.isEnabled) {
        inner();
        setInterval(inner, hourInMs);
    }
};
exports.runMorningMessageLoop = runMorningMessageLoop;
