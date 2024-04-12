import type { IDBPDatabase, IDBPTransaction, DBSchema, StoreNames, StoreKey, StoreValue } from 'idb';

import * as idb from 'idb';

import _each from 'lodash/each.js';
import _slice from 'lodash/slice.js';

export type UpgradeTransaction<DBTypes extends DBSchema | unknown = unknown> = IDBPTransaction<DBTypes, ArrayLike<StoreNames<DBTypes>>, 'versionchange'>;

export type UpgradeFunc<DBTypes extends DBSchema | unknown = unknown> = (database: IDBPDatabase<DBTypes>, oldVersion: number, newVersion: number | null, transaction: UpgradeTransaction<DBTypes>) => void;

export type DbUpgrade<DBTypes extends DBSchema | unknown = unknown> = { doUpgrade: UpgradeFunc<DBTypes>, logLines: any[] };

export class DbUpgrades<DBTypes extends DBSchema | unknown = unknown> {
  private readonly _upgrades: DbUpgrade<DBTypes>[] = [];

  get upgrades(): DbUpgrade<DBTypes>[] { return this._upgrades; }

  add(doUpgrade: UpgradeFunc<DBTypes>, ...logLines: any[]): this {
    this.upgrades.push({ doUpgrade, logLines });
    return this;
  }

  skipVersion(...logLines: any[]): this { return this.add(() => {}, ...logLines); }

  doUpgrade(database: IDBPDatabase<DBTypes>, oldVersion: number, newVersion: number | null, transaction: UpgradeTransaction<DBTypes>): void {
    _each(_slice(this.upgrades, oldVersion), (upgrade: DbUpgrade<DBTypes>) => {
      _each(upgrade.logLines, console.log);
      upgrade.doUpgrade(database, oldVersion, newVersion, transaction);
    });
  }

  get upgrade(): (database: IDBPDatabase<DBTypes>, oldVersion: number, newVersion: number | null, transaction: UpgradeTransaction<DBTypes>) => void {
    return this.doUpgrade.bind(this);
  }

  get length(): number { return this.upgrades.length; }
}

export class IndexedDB<DBTypes extends DBSchema | unknown = unknown> {
  private readonly _db: Promise<IDBPDatabase<DBTypes>>;

  constructor(db: Promise<IDBPDatabase<DBTypes>>) {
    this._db = db;
  }

  store<StoreName extends StoreNames<DBTypes>>(name: StoreName): IndexedDBStore<DBTypes, StoreName> {
    return new IndexedDBStore(this._db, name);
  }
}

export class IndexedDBStore<DBTypes extends DBSchema | unknown = unknown, StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>> {
  private readonly _db: Promise<IDBPDatabase<DBTypes>>;
  private readonly _name: StoreName;

  constructor(db: Promise<IDBPDatabase<DBTypes>>, name: StoreName) {
    this._db = db;
    this._name = name;
  }

  private get db(): Promise<IDBPDatabase<DBTypes>> { return this._db; }
  private get tx(): Promise<IDBPTransaction<DBTypes, [StoreName], 'readwrite'>> {
    return this.db.then((db: IDBPDatabase<DBTypes>) => db.transaction(this.name, 'readwrite'));
  }
  private get readTx(): Promise<IDBPTransaction<DBTypes, [StoreName], 'readonly'>> {
    return this.db.then((db: IDBPDatabase<DBTypes>) => db.transaction(this.name));
  }
  get name(): StoreName { return this._name; }

  async get(key: StoreKey<DBTypes, StoreName>): Promise<StoreValue<DBTypes, StoreName> | undefined> {
    return (await this.readTx).objectStore(this.name).get(key);
  }

  async set(key: StoreKey<DBTypes, StoreName>, value: StoreValue<DBTypes, StoreName>): Promise<void> {
    const tx: IDBPTransaction<DBTypes, [StoreName], 'readwrite'> = await this.tx;
    await tx.objectStore(this.name).put(value, key);
    return tx.done;
  }

  async delete(key: StoreKey<DBTypes, StoreName>): Promise<void> {
    const tx: IDBPTransaction<DBTypes, [StoreName], 'readwrite'> = await this.tx;
    await tx.objectStore(this.name).delete(key);
    return tx.done;
  }

  async clear(): Promise<void> {
    const tx: IDBPTransaction<DBTypes, [StoreName], 'readwrite'> = await this.tx;
    await tx.objectStore(this.name).clear();
    return tx.done;
  }

  async keys(): Promise<StoreKey<DBTypes, StoreName>[]> {
    return (await this.readTx).objectStore(this.name).getAllKeys();
  }
}

export function setupDb<DBTypes extends DBSchema | unknown = unknown>(dbName: string, dbUpgrades: DbUpgrades<DBTypes>): IndexedDB<DBTypes> {
  const { upgrade } = dbUpgrades;
  return new IndexedDB(idb.openDB(dbName, dbUpgrades.length, { upgrade }));
}

export {
  IDBPDatabase,
  IDBPTransaction,
  DBSchema
};
