"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromStore = exports.updateStore = exports.addToStore = exports.getStore = exports.writeToStore = void 0;
/* eslint-disable consistent-return */
const promises_1 = __importDefault(require("fs/promises"));
const lodash_1 = __importDefault(require("lodash"));
const storePath = './store.json';
const writeToStore = async (value) => {
    try {
        await promises_1.default.writeFile(storePath, JSON.stringify(value));
    }
    catch (error) {
        throw new Error(`writeToStore error: ${error}`);
    }
};
exports.writeToStore = writeToStore;
const getStore = async () => {
    try {
        try {
            await promises_1.default.access(storePath);
        }
        catch (error) {
            await (0, exports.writeToStore)({});
        }
        const storeAsJsonString = await promises_1.default.readFile(storePath, { encoding: 'utf8' });
        const store = JSON.parse(storeAsJsonString);
        return store;
    }
    catch (error) {
        throw new Error(`getStore error: ${error}`);
    }
};
exports.getStore = getStore;
const addToStore = async (path, value) => {
    try {
        const newStore = JSON.parse(JSON.stringify(await (0, exports.getStore)()));
        lodash_1.default.set(newStore, path, value);
        (0, exports.writeToStore)(newStore);
    }
    catch (error) {
        throw new Error(`addToStore error: ${error}`);
    }
};
exports.addToStore = addToStore;
const updateStore = async (updates) => {
    try {
        const newStore = JSON.parse(JSON.stringify(await (0, exports.getStore)()));
        updates.forEach(([path, value]) => {
            lodash_1.default.set(newStore, path, value);
        });
        await (0, exports.writeToStore)(newStore);
    }
    catch (error) {
        console.error(error);
    }
};
exports.updateStore = updateStore;
const removeFromStore = async (path) => {
    try {
        const newStore = JSON.parse(JSON.stringify(await (0, exports.getStore)()));
        lodash_1.default.set(newStore, path, undefined);
        (0, exports.writeToStore)(newStore);
    }
    catch (error) {
        throw new Error(`removeFromStore error: ${error}`);
    }
};
exports.removeFromStore = removeFromStore;
