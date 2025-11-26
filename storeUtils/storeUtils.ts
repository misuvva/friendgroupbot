/* eslint-disable consistent-return */
import fs from 'fs/promises';
import _ from 'lodash';

const storePath = './store.json';

export const writeToStore = async (value: any): Promise<void> => {
  try {
    await fs.writeFile(storePath, JSON.stringify(value));
  } catch (error) {
    throw new Error(`writeToStore error: ${error}`);
  }
};

export const getStore = async (): Promise<any> => {
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

export const addToStore = async (path: string | string[], value: any): Promise<void> => {
  try {
    const newStore = JSON.parse(JSON.stringify(await getStore()));
    _.set(newStore, path, value);
    writeToStore(newStore);
  } catch (error) {
    throw new Error(`addToStore error: ${error}`);
  }
};

export const updateStore = async (updates: [string | string[], any][]): Promise<void> => {
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

export const removeFromStore = async (path: string | string[]): Promise<void> => {
  try {
    const newStore = JSON.parse(JSON.stringify(await getStore()));
    _.set(newStore, path, undefined);
    writeToStore(newStore);
  } catch (error) {
    throw new Error(`removeFromStore error: ${error}`);
  }
};
