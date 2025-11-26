/* eslint-disable prefer-destructuring */
import { google } from 'googleapis';
import _ from 'lodash';
import { Duration } from 'luxon';
import { Message, MessageEmbed } from 'discord.js';

const auth = new google.auth.GoogleAuth({
  keyFile: './handlers/sheetsHandler/serverbot-348821-a7dd28246089.json',
  scopes: ['https://www.googleapis.com/auth/youtube'],
});

const youtube = google.youtube({
  version: 'v3',
  auth,
});

export const youtubeEmbedHandler = async (message: Message, embed: MessageEmbed) => {
  let videoId: string;
  if (!embed.url) return;

  if (embed.url.includes('youtu.be')) {
    videoId = embed.url.split('/')[4];
  } else {
    videoId = embed.url.split('?v=')[1];
  }
  if (videoId.includes('?')) videoId = videoId.split('?')[0];

  const response = await youtube.videos.list({
    id: [videoId],
    part: ['contentDetails']
  });

  const durationISO = _.get(response, 'data.items.0.contentDetails.duration');
  if (durationISO) {
    const duration = Duration.fromISO(durationISO).toHuman();
    message.reply({ content: `This video is ${duration} long` });
  }
};
