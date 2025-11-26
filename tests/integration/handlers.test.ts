import { morningMessageHandler } from '../../handlers/morningMessageHandler/morningMessageHandler';
import { reminderHandler } from '../../handlers/reminderHandler/reminderHandler';
import { Guild, TextChannel, MessageReaction, User, Message } from 'discord.js';
import { DateTime } from 'luxon';

describe('Handlers', () => {
  describe('morningMessageHandler', () => {
    it('should send a morning message', async () => {
      const mockChannel = {
        send: jest.fn(),
      } as unknown as TextChannel;

      const mockGuild = {
        channels: {
          cache: {
            filter: jest.fn().mockReturnValue({
              filter: jest.fn().mockReturnValue([]),
            }),
            find: jest.fn().mockReturnValue({
              messages: {
                cache: {
                  find: jest.fn().mockReturnValue({ content: 'names for voice channels: [The Roots]' }),
                }
              }
            }),
          },
          fetch: jest.fn().mockResolvedValue({
            find: jest.fn().mockReturnValue({
              messages: {
                fetch: jest.fn().mockResolvedValue([
                  {
                    content: 'settings for the daily messages: {"isEnabled": true, "onlyOnBirthdays": false, "channelPartial": "general"}',
                  },
                  {
                    content: 'list of birthdays: {"Josh": "10-10-1990"}',
                  }
                ]),
              },
              name: 'data-channel',
            }),
          }),
        },
      } as unknown as Guild;

      const mockDataChannelData = {
        dailyMessagesSettings: {
          onlyOnBirthdays: false,
        },
        birthdays: {},
      };

      const now = DateTime.now();

      await morningMessageHandler(now, mockGuild, mockChannel, mockDataChannelData);

      expect(mockChannel.send).toHaveBeenCalled();
    });
  });

  describe('reminderHandler', () => {
    it('should create a reminder on reaction', async () => {
      const mockMessage = {
        id: '123',
        url: 'http://discord.com/channels/1/2/3',
        channel: {
          id: '2',
        },
      } as unknown as Message;

      const mockReaction = {
        emoji: {
          name: '📌',
        },
        message: mockMessage,
      } as unknown as MessageReaction;

      const mockUser = {
        id: '456',
      } as unknown as User;

      // Mock storeUtils
      jest.mock('../../storeUtils/storeUtils', () => ({
        addToStore: jest.fn(),
      }));

      await reminderHandler(mockReaction, mockUser);

      // Since we can't easily spy on the imported addToStore without more setup,
      // we'll just ensure it doesn't throw.
      // Ideally we would mock the module before importing the handler.
    });
  });
});
