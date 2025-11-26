"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeEmbedHandler = void 0;
/* eslint-disable prefer-destructuring */
const googleapis_1 = require("googleapis");
const lodash_1 = __importDefault(require("lodash"));
const luxon_1 = require("luxon");
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: './handlers/sheetsHandler/serverbot-348821-a7dd28246089.json',
    scopes: ['https://www.googleapis.com/auth/youtube'],
});
const youtube = googleapis_1.google.youtube({
    version: 'v3',
    auth,
});
const youtubeEmbedHandler = async (message, embed) => {
    let videoId;
    if (!embed.url)
        return;
    if (embed.url.includes('youtu.be')) {
        videoId = embed.url.split('/')[4];
    }
    else {
        videoId = embed.url.split('?v=')[1];
    }
    if (videoId.includes('?'))
        videoId = videoId.split('?')[0];
    const response = await youtube.videos.list({
        id: [videoId],
        part: ['contentDetails']
    });
    const durationISO = lodash_1.default.get(response, 'data.items.0.contentDetails.duration');
    if (durationISO) {
        const duration = luxon_1.Duration.fromISO(durationISO).toHuman();
        message.reply({ content: `This video is ${duration} long` });
    }
};
exports.youtubeEmbedHandler = youtubeEmbedHandler;
