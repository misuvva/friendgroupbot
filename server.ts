import express from 'express';
import { request } from 'undici';

const {
  CLIENT_ID, CLIENT_SECRET, PORT, SERVER_ADDRESS
} = process.env;

export const Oauth2Server = (): void => {

  const app = express();

  app.get('/', async ({ query }, response) => {
    const { code } = query;

    if (code) {
      try {
        const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
          method: 'POST',
          body: new URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: `${SERVER_ADDRESS}:${PORT}`,
            scope: 'identify',
          }).toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const oauthData = await tokenResponseData.body.json();
        console.log(oauthData);
      } catch (error) {
        console.error(error);
      }
    }

    return response.sendFile('index.html', { root: '.' });
  });
  app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
};
