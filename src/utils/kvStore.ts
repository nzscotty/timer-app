import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

let _db: SQLiteDatabase | null = null;

function getDb(): SQLiteDatabase {
  if (!_db) {
    _db = openDatabaseSync('app.db');
    _db.execSync(
      'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);'
    );
  }
  return _db;
}

export const kvStore = {
  get(key: string): string | null {
    try {
      const row = getDb().getFirstSync<{ value: string }>(
        'SELECT value FROM kv WHERE key = ?;',
        [key]
      );
      return row?.value ?? null;
    } catch (e) {
      console.warn('[kvStore] get error:', e);
      return null;
    }
  },

  set(key: string, value: string): void {
    try {
      getDb().runSync(
        'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
        [key, value]
      );
    } catch (e) {
      console.warn('[kvStore] set error:', e);
    }
  },
};
