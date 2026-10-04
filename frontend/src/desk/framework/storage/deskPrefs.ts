/**
 * Small preferences that should survive a reload and a logout.
 * Each feature stores one record per key. This is not the autocomplete cache,
 * which is cleared with the session.
 */

const DB_NAME = 'ankpal-desk-prefs';
const DB_VERSION = 1;
const STORE_NAME = 'prefs';

interface PrefRecord<T> {
  key: string;
  value: T;
}

function openPrefs(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined' || typeof indexedDB.open !== 'function') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    const giveUp = window.setTimeout(() => resolve(null), 500);
    request.onerror = () => {
      window.clearTimeout(giveUp);
      resolve(null);
    };
    request.onsuccess = () => {
      window.clearTimeout(giveUp);
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

/** The stored value, or null when nothing is saved or IndexedDB cannot be used. */
export async function readDeskPref<T>(key: string): Promise<T | null> {
  try {
    const db = await openPrefs();
    if (!db) return null;
    return await new Promise((resolve) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onerror = () => resolve(null);
      request.onsuccess = () => {
        const row = request.result as PrefRecord<T> | undefined;
        resolve(row ? row.value : null);
      };
    });
  } catch {
    return null;
  }
}

/** Save a value. Does nothing when IndexedDB is missing or the write fails. */
export async function writeDeskPref<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openPrefs();
    if (!db) return;
    const stored = JSON.parse(JSON.stringify({ key, value })) as PrefRecord<T>;
    await new Promise<void>((resolve) => {
      const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(stored);
      request.onerror = () => resolve();
      request.onsuccess = () => resolve();
    });
  } catch {
    // A private window or a closed tab. The choice still applies until reload.
  }
}
