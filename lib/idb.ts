import type { IDBPDatabase, DBSchema, IndexedDB, IndexedDBStore } from './idb-wrapper';

import { DbUpgrades, setupDb } from './idb-wrapper';

export type ConfigKey = 'colors' | 'user-content';

export interface Schema extends DBSchema {
  config: {
    key: ConfigKey,
    value: string
  }
}

const dbUpgrades: DbUpgrades<Schema> = new DbUpgrades<Schema>();

// v1 - NOTE
dbUpgrades.add((database: IDBPDatabase<Schema>) => database.createObjectStore('config', { autoIncrement: true }));

export function openDb(): IndexedDB<Schema> {
  return setupDb('hour-entry', dbUpgrades);
}

export {
  IndexedDB,
  IndexedDBStore
};
