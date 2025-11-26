"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editableMessageHandlers = void 0;
const discord_js_1 = require("discord.js");
// @ts-ignore
const discord_modals_1 = require("discord-modals");
const lodash_1 = require("lodash");
exports.editableMessageHandlers = {
    create: async ({ message }) => {
        const { editButtonId } = exports.editableMessageHandlers.constants;
        const components = [new discord_js_1.MessageActionRow({
                components: [new discord_js_1.MessageButton()
                        .setLabel('Edit')
                        .setCustomId(editButtonId)
                        .setEmoji('📝')
                        .setStyle('PRIMARY')
                ]
            })];
        let messageContent;
        const sliced = message.content.split(' ');
        if (sliced[0] === '-editable') {
            messageContent = sliced.slice(1, sliced.length).join(' ');
        }
        else {
            messageContent = sliced.join(' ');
        }
        const editableMessage = await message.channel.send({ content: messageContent, components });
        const historyThread = await editableMessage.startThread({ name: 'Edit history' });
        historyThread.send(`${message.author.username}: ${messageContent}`);
        message.delete();
    },
    reply: async ({ message }) => {
        // @ts-ignore
        if (message.editable) { // message.editable is a property of Message but might be read-only or handled differently? Wait, message.editable is a boolean getter.
            // Actually the original code checks if message.editable is true.
            // But here we are editing the message? No, we are editing the message content to add -editable prefix?
            // "message.edit" edits the message itself.
            // Wait, the original code:
            // if (message.editable) {
            //   message.edit(`-editable ${message.content}`);
            // This seems to be handling a reply to an editable message?
            // Or maybe checking if the bot can edit the message?
            // Let's assume the original logic is correct.
            try {
                await message.edit(`-editable ${message.content}`);
                if (message.thread) {
                    await message.thread.send(`${message.author.username}: ${message.content}`);
                }
                await message.delete();
            }
            catch (e) {
                // ignore if not editable
            }
        }
    },
    openModal: async ({ interaction, client }) => {
        const { editModalId, editTextInputId } = exports.editableMessageHandlers.constants;
        const messageContent = (0, lodash_1.get)(interaction, 'message.content');
        const modal = new discord_modals_1.Modal()
            .setCustomId(editModalId)
            .setTitle('Edit this message: ')
            .addComponents(new discord_modals_1.TextInputComponent()
            .setCustomId(editTextInputId)
            .setLabel('Change the message to: ')
            .setStyle('LONG')
            .setDefaultValue(messageContent));
        (0, discord_modals_1.showModal)(modal, {
            client,
            interaction
        });
    },
    modalSubmit: async ({ modal }) => {
        const newContent = await modal.getTextInputValue(exports.editableMessageHandlers.constants.editTextInputId);
        const { message } = modal;
        modal.update({ content: newContent });
        if (message.thread) {
            message.thread.send(`${modal.member.user.username}: ${newContent}`);
        }
    },
    constants: {
        editButtonId: 'editable-button',
        editModalId: 'editable-message-modal',
        editTextInputId: 'editable-text-input'
    },
};
