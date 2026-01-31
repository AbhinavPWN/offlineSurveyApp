import { SQLiteDatabase } from "expo-sqlite";

export const migration001 ={
    version : 1,
    
    async up(db:SQLiteDatabase):Promise<void>{
        // SQL is going here
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS households(
                id TEXT PRIMARY KEY,
                household_code TEXT NOT NULL UNIQUE,

                status TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1 ,
                submitted_at TEXT,
                
                
                created_by_user_id TEXT NOT NULL ,
                chw_id TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,

                province_code TEXT,
                district_code TEXT,
                vdc_code TEXT,
                ward_no INTEGER,
                address TEXT,

                gps_lat REAL,
                gps_lng REAL, 
                gps_accuracy REAL, 

                household_member_count INTEGER,
                housing_type_code TEXT,
                has_clean_water INTEGER,
                has_sanitation INTEGER,

                server_id TEXT,
                deleted_at TEXT
            )     
        `);

        await db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_households_status 
                ON households (status);
            `);

        await db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_households_deleted
                ON households (deleted_at);
            
            `);    
    }
}