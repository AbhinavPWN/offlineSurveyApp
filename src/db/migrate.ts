import * as SQLite from 'expo-sqlite';

import type{ SQLiteDatabase} from 'expo-sqlite'
import { migrations } from './migrations';
 
// One Db,opened synchronously and used everywhere in app
export const db = SQLite.openDatabaseSync('survey_app.db')

export type Migration ={
    version : number
    up: (db: SQLiteDatabase) => Promise<void>

}

// reading current schema version
async function getCurrentDbVersion(db: SQLite.SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{user_version: number}>(
        "PRAGMA user_version"
    )
    return row?.user_version ?? 0 ;
}

// Running one Migration(transaction controlled)
async function runSingleMigration(
    db:SQLite.SQLiteDatabase,
    migration:{version:number; up:(db:SQLite.SQLiteDatabase) => Promise<void>}
){
    await db.execAsync("BEGIN")

    try{
        await migration.up(db)
        await db.execAsync(`PRAGMA user_version = ${migration.version}`)
        await db.execAsync('COMMIT')
    } catch(error){
        await db.execAsync("ROLLBACK ")
        throw error
    }
}

// Migration Runner 
export async function runMigration(): Promise<void> {
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA foreign_keys = ON;");

    const currentVersion = await getCurrentDbVersion(db);

    for (const migration of migrations){
        if (migration.version > currentVersion){
            await runSingleMigration(db,migration)
        }
    }
}