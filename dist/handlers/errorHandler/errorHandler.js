"use strict";
/* eslint-disable consistent-return */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const luxon_1 = require("luxon");
const storeUtils_1 = require("../../storeUtils/storeUtils");
const errorsPath = 'errorLogs';
const errorHandler = (error) => {
    try {
        const timestamp = luxon_1.DateTime.now().toString().replace(/\./g, '_');
        (0, storeUtils_1.addToStore)(`${errorsPath}.${timestamp}`, error.toString());
        console.error(error);
    }
    catch (err) {
        (0, exports.errorHandler)(err);
    }
};
exports.errorHandler = errorHandler;
