"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolarString = void 0;
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-template */
const promises_1 = __importDefault(require("fs/promises"));
const lodash_1 = __importDefault(require("lodash"));
const dataChannelHandler_1 = require("../dataChannelHandler");
const utils_1 = require("../../utils/utils");
const getSolarBirthdays = async (birthdays) => {
    const calendarAsJsonString = await promises_1.default.readFile('./calendar.json', { encoding: 'utf8' });
    const calendar = JSON.parse(calendarAsJsonString);
    const solarBirthdays = {};
    Object.keys(birthdays).forEach((partial) => {
        const gregorianString = birthdays[partial];
        const calendarKey = gregorianString.split('-').join('/');
        let birthDayOfMonth = Number(calendar[calendarKey].solar.split([' '])[1].slice(0, -1));
        solarBirthdays[partial] = { full: calendar[calendarKey].solar, birthDayOfMonth };
    });
    return solarBirthdays;
};
const getSolarSeason = (month, day) => {
    let firstPart;
    switch (month) {
        case 'July':
            firstPart = day <= 15 ? '💥🌞Summer Bursting🌞💥' : '🌴🌞Summer in Repose🌞🌴';
            break;
        case 'August':
            firstPart = day <= 15 ? '💤🌞Summer Sleeping🌞💤' : '👂🍁Autumn Calling🍁👂';
            break;
        case 'September':
            firstPart = day <= 15 ? '🍃🍁Autumn in Flight🍁🍃' : '🕸️🍁Autumn in Vain🍁🕸️';
            break;
        case 'October':
            firstPart = day <= 15 ? '⚡️🍁Autumn Falling🍁⚡️' : '🌚🍁Autumn in Mourning🍁🌚';
            break;
        case 'November':
            firstPart = day <= 15 ? '🌈🍁Autumn in Memory🍁🌈' : '👁️❄️Winter Awake❄️👁️';
            break;
        case 'December':
            firstPart = day <= 15 ? '🏔️❄️Winter Alone❄️🏔️' : '🎶❄️Winter Harmonic❄️🎶';
            break;
        case 'January':
            firstPart = day <= 15 ? '🎊❄️Winter in Chorus❄️🎊' : '🥀❄️Winter in Reprise❄️🥀';
            break;
        case 'February':
            firstPart = day <= 15 ? '⭐️❄️Winter All-Aglow❄️⭐️' : '🌱🌼Spring in Quiet🌼🌱';
            break;
        case 'March':
            firstPart = day <= 15 ? '🐝🌼Spring Bittersweet🌼🐝' : '🌿🌼Spring in Bloom🌼🌿';
            break;
        case 'April':
            firstPart = day <= 15 ? '💐🌼Spring Overflowing🌼💐' : '🕊️🌼Spring Coming Home🌼🕊';
            break;
        case 'May':
            firstPart = day <= 15 ? '🚪🌼Spring At-the-door🌼🚪' : '👁️🌞Summer Waking🌞👁️';
            break;
        case 'June':
            firstPart = day <= 15 ? '🎶🌞Summer Singing🌞🎶' : '🎺🌞Summer in Glory🌞🎺';
            break;
        default:
            break;
    }
    return `**${firstPart}**`;
};
const getBirthdaysOnDayOfMonth = (birthdays, dayOfMonth) => Object.entries(birthdays)
    .filter(([, { birthDayOfMonth }]) => birthDayOfMonth === dayOfMonth);
const getSolarString = async (guild, solar, check = false) => {
    const dataChannelData = await (0, dataChannelHandler_1.getData)(guild);
    if (!dataChannelData)
        return;
    const { birthdays } = dataChannelData;
    const allSolarBirthdays = await getSolarBirthdays(birthdays);
    const solarDayOfMonth = Number(solar.split(' ')[1].slice(0, -1));
    const birthdaysToday = getBirthdaysOnDayOfMonth(allSolarBirthdays, solarDayOfMonth);
    let currentBirthdayString = '';
    let isCurrentBirthday = false;
    if (birthdaysToday.length) {
        isCurrentBirthday = true;
        let names = [];
        let hearts = [];
        for (let i = 0; i < birthdaysToday.length; i++) {
            const [partial] = birthdaysToday[i];
            const { heart, mention } = await (0, utils_1.getNameAndHeartFromPartial)(guild, partial);
            names.push(mention.toString()); // mention is Role, toString gives mention string
            hearts.push(heart);
        }
        if (names.length) {
            const namesString = (0, utils_1.joinWithAnds)(lodash_1.default.shuffle(names));
            currentBirthdayString = `${(0, utils_1.surround)(namesString, lodash_1.default.shuffle(hearts))}'s day!`;
        }
    }
    currentBirthdayString += '\n';
    let upcomingBirthaysString = '**';
    const upcomingBirthdaysThreshold = 6;
    let isUpcomingBirthdays = false;
    for (let i = 1; i <= upcomingBirthdaysThreshold; i++) {
        let futureDayOfMonth = solarDayOfMonth + i;
        if (solarDayOfMonth + i > 30) {
            futureDayOfMonth -= 30;
        }
        const birthdaysOnThisDay = getBirthdaysOnDayOfMonth(allSolarBirthdays, futureDayOfMonth);
        for (let j = 0; j < birthdaysOnThisDay.length; j++) { // Changed i to j to avoid shadowing
            if (birthdaysOnThisDay[j])
                isUpcomingBirthdays = true;
            const [partial] = birthdaysOnThisDay[j];
            const { heart } = await (0, utils_1.getNameAndHeartFromPartial)(guild, partial);
            upcomingBirthaysString += heart;
        }
        if (!birthdaysOnThisDay.length)
            upcomingBirthaysString += '-';
        if (i < upcomingBirthdaysThreshold)
            upcomingBirthaysString += '|';
    }
    upcomingBirthaysString += '** \n';
    const month = solar.split(',')[0].split(' ')[0];
    const solarSeason = getSolarSeason(month, solarDayOfMonth);
    const solarString = (isCurrentBirthday ? currentBirthdayString : '')
        + (isUpcomingBirthdays ? upcomingBirthaysString : '')
        + '☀️ ' + solar
        + '\n'
        + solarSeason;
    if (check)
        return isCurrentBirthday;
    return solarString;
};
exports.getSolarString = getSolarString;
