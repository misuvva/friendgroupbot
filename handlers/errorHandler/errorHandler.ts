/* eslint-disable consistent-return */

import { DateTime } from 'luxon';
import { addToStore } from '../../storeUtils/storeUtils';

const errorsPath = 'errorLogs';

export const errorHandler = (error: any) => {
  try {
    const timestamp = DateTime.now().toString().replace(/\./g, '_');
    addToStore(`${errorsPath}.${timestamp}`, error.toString());
    console.error(error);
  } catch (err) {
    errorHandler(err);
  }
};
