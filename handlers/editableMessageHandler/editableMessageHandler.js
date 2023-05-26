const {
  MessageActionRow, MessageButton,
} = require('discord.js');
const { Modal, showModal, TextInputComponent } = require('discord-modals');
const { get } = require('lodash');

const editableMessageHandlers = {
  create: async ({ message }) => {
    const { editButtonId } = editableMessageHandlers.constants;
    const components = [new MessageActionRow({
      components: [new MessageButton({
        label: 'Edit',
        customId: editButtonId,
        emoji: '📝',
        style: 'PRIMARY'
      })]
    })];
    const sliced = message.content.split(' ');
    const messageContent = sliced.slice(1, sliced.length).join(' ');
    const editableMessage = await message.channel.send({ content: messageContent, components });
    const historyThread = await editableMessage.startThread({ name: 'Edit history' });
    historyThread.send(`${message.author.username}: ${messageContent}`);
    message.delete();
  },
  reply: async ({ message }) => {
    if (message.editable) {
      message.edit(`-editable ${message.content}`);
      if (message.thread) {
        message.thread.send(`${message.author.username}: ${message.content}`);
      }
      message.delete();
    }
  },
  openModal: async ({ interaction, client }) => {
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
  modalSubmit: async ({ modal }) => {
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

module.exports = {
  editableMessageHandlers
};
