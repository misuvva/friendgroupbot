/* eslint-disable consistent-return */
const fs = require('fs/promises');
const _ = require('lodash');

const storePath = './store.json';
const writeToStore = async (value) => {
  try {
    await fs.writeFile(storePath, JSON.stringify(value));
  } catch (error) {
    throw new Error(`writeToStore error: ${error}`);
  }
};

const getStore = async () => {
  try {
    try {
      await fs.access(storePath);
    } catch (error) {
      await writeToStore({});
    }
    const storeAsJsonString = await fs.readFile(storePath, { encoding: 'utf8' });
    const store = JSON.parse(storeAsJsonString);
    return store;
  } catch (error) {
    throw new Error(`getStore error: ${error}`);
  }
};

const addToStore = async (path, value) => {
  try {
    const newStore = JSON.parse(JSON.stringify(await getStore()));
    _.set(newStore, path, value);
    writeToStore(newStore);
  } catch (error) {
    throw new Error(`addToStore error: ${error}`);
  }
};

const updateStore = async (updates) => {
  try {
    const newStore = JSON.parse(JSON.stringify(await getStore()));
    updates.forEach(([path, value]) => {
      _.set(newStore, path, value);
    });
    await writeToStore(newStore);
  } catch (error) {
    console.error(error);
  }
};

const removeFromStore = async (path) => {
  try {
    const newStore = JSON.parse(JSON.stringify(await getStore()));
    _.set(newStore, path, undefined);
    writeToStore(newStore);
  } catch (error) {
    throw new Error(`removeFromStore error: ${error}`);
  }
};

module.exports = {
  writeToStore,
  addToStore,
  updateStore,
  getStore,
  removeFromStore
};