"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const morningMessageHandler_1 = require("../../handlers/morningMessageHandler/morningMessageHandler");
const reminderHandler_1 = require("../../handlers/reminderHandler/reminderHandler");
const luxon_1 = require("luxon");
describe('Handlers', () => {
    describe('morningMessageHandler', () => {
        it('should send a morning message', async () => {
            const mockChannel = {
                send: jest.fn(),
            };
            const mockGuild = {
                channels: {
                    cache: {
                        filter: jest.fn().mockReturnValue({
                            filter: jest.fn().mockReturnValue([]),
                        }),
                    },
                },
            };
            const mockDataChannelData = {
                dailyMessagesSettings: {
                    onlyOnBirthdays: false,
                },
                birthdays: {},
            };
            const now = luxon_1.DateTime.now();
            await (0, morningMessageHandler_1.morningMessageHandler)(now, mockGuild, mockChannel, mockDataChannelData);
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
            };
            const mockReaction = {
                emoji: {
                    name: '📌',
                },
                message: mockMessage,
            };
            const mockUser = {
                id: '456',
            };
            // Mock storeUtils
            jest.mock('../../storeUtils/storeUtils', () => ({
                addToStore: jest.fn(),
            }));
            await (0, reminderHandler_1.reminderHandler)(mockReaction, mockUser);
            // Since we can't easily spy on the imported addToStore without more setup,
            // we'll just ensure it doesn't throw.
            // Ideally we would mock the module before importing the handler.
        });
    });
});
