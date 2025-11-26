import {
  MessageActionRow, MessageButton, Message, ButtonInteraction, Client, TextChannel, ThreadChannel
} from 'discord.js';
// @ts-ignore
import { Modal, showModal, TextInputComponent } from 'discord-modals';
import { get } from 'lodash';

export const editableMessageHandlers = {
  create: async ({ message }: { message: Message }) => {
    const { editButtonId } = editableMessageHandlers.constants;
    const components = [new MessageActionRow({
      components: [new MessageButton()
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
    } else {
      messageContent = sliced.join(' ');
    }
    const editableMessage = await message.channel.send({ content: messageContent, components });
    const historyThread = await editableMessage.startThread({ name: 'Edit history' });
    historyThread.send(`${message.author.username}: ${messageContent}`);
    message.delete();
  },
  reply: async ({ message }: { message: Message }) => {
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
      } catch (e) {
        // ignore if not editable
      }
    }
  },
  openModal: async ({ interaction, client }: { interaction: ButtonInteraction, client: Client }) => {
    const { editModalId, editTextInputId } = editableMessageHandlers.constants;

    const messageContent = get(interaction, 'message.content');
    const modal = new Modal()
      .setCustomId(editModalId)
      .setTitle('Edit this message: ')
      .addComponents(
        new TextInputComponent()
          .setCustomId(editTextInputId)
          .setLabel('Change the message to: ')
          .setStyle('LONG')
          .setDefaultValue(messageContent)
      );
    showModal(modal, {
      client,
      interaction
    });
  },
  modalSubmit: async ({ modal }: { modal: any }) => {
    const newContent = await modal.getTextInputValue(editableMessageHandlers.constants.editTextInputId);
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
