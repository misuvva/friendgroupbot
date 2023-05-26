/* eslint-disable consistent-return */

const { DateTime } = require('luxon');
const { addToStore } = require('../../storeUtils/storeUtils');

const errorsPath = 'errorLogs';

const errorHandler = (error) => {
  try {
    const timestamp = DateTime.now().toString().replaceAll('.', '_');
    addToStore(`${errorsPath}.${timestamp}`, error.toString());
    console.error(error);
  } catch (err) {
    errorHandler(err);
  }
};

module.exports = {
  errorHandler
};
