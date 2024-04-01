import * as idb from 'idb';
import type { IDBPDatabase, IDBPTransaction, DBSchema, StoreNames } from 'idb';

type UpgradeTransaction<DBTypes extends DBSchema | unknown = unknown> = IDBPTransaction<DBTypes, ArrayLike<StoreNames<DBTypes>>, 'versionchange'>;

type UpgradeFunc<DBTypes extends DBSchema | unknown = unknown> = (database: IDBPDatabase<DBTypes>, oldVersion: number, newVersion: number | null, transaction: UpgradeTransaction<DBTypes>) => void;

type DbUpgrade<DBTypes extends DBSchema | unknown = unknown> = {doUpgrade: UpgradeFunc<DBTypes>, logLines: any[] }

class DbUpgrades<DBTypes extends DBSchema | unknown = unknown> {
    private readonly _upgrades: DbUpgrade<DBTypes>[] = [];

    get upgrades(): DbUpgrade<DBTypes>[] { return this._upgrades; }

    add(doUpgrade: UpgradeFunc<DBTypes>, ...logLines: any[]): this {
        this.upgrades.push({ doUpgrade, logLines });
        return this;
    }

    skipVersion(...logLines: any[]): this { return this.add(() => {}, ...logLines); }

    upgrade(database: IDBPDatabase<DBTypes>, oldVersion: number, newVersion: number | null, transaction: UpgradeTransaction<DBTypes>): void {
        this.upgrades.slice(oldVersion).forEach((upgrade: DbUpgrade<DBTypes>) => {
            upgrade.logLines.forEach(console.log);
            upgrade.doUpgrade(database, oldVersion, newVersion, transaction);
        });
    }

    get length(): number { return this.upgrades.length; }
}

const dbUpgrades: DbUpgrades = new DbUpgrades<any>();

// v1 - NOTE
dbUpgrades.add((database: IDBPDatabase<any>, oldVersion: number, newVersion: number | null, transaction: UpgradeTransaction<any>) => database.createObjectStore('config', { autoIncrement: true }));

export class IndexedDB {
    private readonly _db: Promise<IDBPDatabase<any>>;

    constructor(db: Promise<IDBPDatabase<any>>) {
        this._db = db;
    }

    store(name: string): IndexedDBStore {
        return new IndexedDBStore(this._db, name);
    }
}

export class IndexedDBStore {
    private readonly _db: Promise<IDBPDatabase<any>>;
    public readonly name: string;

    constructor(db: Promise<IDBPDatabase<any>>, name: string) {
        this._db = db;
        this.name = name;
    }

    async get(key: any): Promise<any> {
        const db: IDBPDatabase<any> = await this._db;
        return db.transaction(this.name).objectStore(this.name).get(key);
    }

    async set(key: any, value: any): Promise<void> {
        const db: IDBPDatabase<any> = await this._db;
        const tx: IDBPTransaction<any, [string], 'readwrite'> = db.transaction(this.name, 'readwrite');
        await tx.objectStore(this.name).put(value, key);
        return tx.done;
    }

    async delete(key: any): Promise<void> {
        const db: IDBPDatabase<any> = await this._db;
        const tx: IDBPTransaction<any, [string], 'readwrite'> = db.transaction(this.name, 'readwrite');
        await tx.objectStore(this.name).delete(key);
        return tx.done;
    }

    async clear(): Promise<void> {
        const db: IDBPDatabase<any> = await this._db;
        const tx: IDBPTransaction<any, [string], 'readwrite'> = db.transaction(this.name, 'readwrite');
        await tx.objectStore(this.name).clear();
        return tx.done;
    }

    async keys(): Promise<any[]> {
        const db: IDBPDatabase<any> = await this._db;
        return db.transaction(this.name).objectStore(this.name).getAllKeys();
    }
}

export function openDb(): IndexedDB {
    const { upgrade } = dbUpgrades;
    return new IndexedDB(idb.openDB('hour-entry', dbUpgrades.length, { upgrade }));
}
