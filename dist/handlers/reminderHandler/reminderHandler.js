"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonInteractionHandler = exports.reminderHandler = exports.remindersMinuteLoop = exports.createButton = exports.remindersKey = exports.buttonsRegistry = void 0;
/* eslint-disable quotes */
/* eslint-disable arrow-parens */
/* eslint-disable default-case */
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
// @ts-ignore
const suncalc_1 = __importDefault(require("suncalc"));
const errorHandler_1 = require("../errorHandler/errorHandler");
const storeUtils_1 = require("../../storeUtils/storeUtils");
const utils_1 = require("../dmHandler/utils");
const longBeachCoordinates = {
    lat: 33.7701,
    long: 118.1937
};
const oneHourInMilliseconds = 1000 * 60 * 60;
exports.buttonsRegistry = {};
exports.remindersKey = 'reminders';
const createButton = (options) => {
    const { onPress, ...buttonOptions } = options;
    const button = new discord_js_1.MessageButton(buttonOptions);
    exports.buttonsRegistry[options.customId] = { onPress, button };
    return button;
};
exports.createButton = createButton;
const createReminder = async (message, user, milliseconds) => {
    const createdAt = luxon_1.DateTime.now().toMillis();
    const reminder = {
        userId: user.id,
        message: {
            id: message.id,
            url: message.url,
            channel: {
                id: message.channel.id
            }
        },
        id: (0, utils_1.generateAnonId)(),
        targetTime: createdAt + milliseconds,
        createdAt
    };
    (0, storeUtils_1.addToStore)(`${exports.remindersKey}.${reminder.id}`, reminder);
};
const createReminderAtTime = async (messageReaction, user, targetTime) => {
    const createdAt = luxon_1.DateTime.now().toMillis();
    const reminder = {
        userId: user.id,
        messageUrl: messageReaction.message.url,
        id: (0, utils_1.generateAnonId)(),
        targetTime,
        createdAt
    };
    (0, storeUtils_1.addToStore)(`${exports.remindersKey}.${reminder.id}`, reminder);
};
const sunriseReminder = async (messageReaction, user) => {
    const createdAt = luxon_1.DateTime
        .now()
        .setZone('UTC-7:00');
    const { sunrise } = suncalc_1.default.getTimes(createdAt.toJSDate(), longBeachCoordinates.lat, longBeachCoordinates.long);
    const sunriseTime = luxon_1.DateTime.fromJSDate(sunrise);
    createReminderAtTime(messageReaction, user, sunriseTime.toMillis());
};
const sunsetReminder = async (messageReaction, user) => {
    const createdAt = luxon_1.DateTime
        .now()
        .setZone('UTC-7:00');
    const { sunset } = suncalc_1.default.getTimes(createdAt.toJSDate(), longBeachCoordinates.lat, longBeachCoordinates.long);
    const sunsetTime = luxon_1.DateTime.fromJSDate(sunset);
    createReminderAtTime(messageReaction, user, sunsetTime.toMillis());
};
const remindersMinuteLoop = async (guild) => {
    const store = await (0, storeUtils_1.getStore)();
    const reminders = store[exports.remindersKey];
    const members = await guild.members.fetch();
    if (!reminders)
        return;
    Object.entries(reminders).forEach(async ([id, reminder]) => {
        const targetTime = luxon_1.DateTime.fromMillis(reminder.targetTime).toMillis();
        const now = luxon_1.DateTime.now().toMillis();
        if (targetTime < now) {
            const member = members.find(member => member.user.id === reminder.userId);
            if (!member)
                return;
            const messageChannel = await guild.channels.fetch(reminder.message.channel.id);
            const message = await messageChannel.messages.fetch(reminder.message.id);
            member.user.send({
                content: `You asked me to remind you about this message`,
                embeds: [new discord_js_1.MessageEmbed({
                        url: message.url,
                        title: `${message.member?.displayName}: ${message.content}`,
                        color: message.member?.displayColor
                    })],
                components: [new discord_js_1.MessageActionRow({
                        components: [
                            (0, exports.createButton)({
                                label: 'Snooze (15m)',
                                style: 'PRIMARY',
                                customId: 'snooze-button-15-minutes',
                                onPress: (interaction) => {
                                    createReminder(message, member.user, 1000 * 60 * 15);
                                    interaction.reply('Got it! Snoozing for 15 Minutes');
                                }
                            }),
                            (0, exports.createButton)({
                                label: 'Znooze (1H)',
                                style: 'PRIMARY',
                                customId: 'snooze-button-1-hour',
                                onPress: (interaction) => {
                                    createReminder(message, member.user, oneHourInMilliseconds);
                                    interaction.reply('Got it! Znoozing for 1 Hour');
                                }
                            }),
                            (0, exports.createButton)({
                                label: 'Znuzz (5H)',
                                style: 'PRIMARY',
                                customId: 'snooze-button-5-hours',
                                onPress: (interaction) => {
                                    createReminder(message, member.user, oneHourInMilliseconds * 5);
                                    interaction.reply('Got it! Znuzzing for 5 Hours');
                                }
                            }),
                        ],
                    })]
            });
            (0, storeUtils_1.removeFromStore)(`${exports.remindersKey}.${id}`);
        }
    });
};
exports.remindersMinuteLoop = remindersMinuteLoop;
const reminderHandler = async (messageReaction, user) => {
    try {
        if (!messageReaction.emoji.name)
            return;
        switch (messageReaction.emoji.name) {
            case '🌇':
                sunsetReminder(messageReaction, user);
                break;
            case '🌅':
                sunriseReminder(messageReaction, user);
                break;
            case '📌':
                createReminder(messageReaction.message, user, 10);
                break;
            case '⏲️':
                createReminder(messageReaction.message, user, oneHourInMilliseconds);
                break;
            case '☄️':
                createReminder(messageReaction.message, user, oneHourInMilliseconds * 5);
                break;
        }
    }
    catch (error) {
        (0, errorHandler_1.errorHandler)(error);
    }
};
exports.reminderHandler = reminderHandler;
const buttonInteractionHandler = (interaction) => {
    if (exports.buttonsRegistry[interaction.customId]) {
        exports.buttonsRegistry[interaction.customId].onPress(interaction);
    }
};
exports.buttonInteractionHandler = buttonInteractionHandler;
