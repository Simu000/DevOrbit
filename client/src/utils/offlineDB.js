import Dexie from 'dexie';

export class OfflineDB extends Dexie {
  constructor() {
    super('DevOrbitDB');
    
    this.version(1).stores({
      tutorials: '++id, title, authorId, category, createdAt',
      messages: '++id, roomId, content, userId, createdAt, syncStatus',
      journalEntries: '++id, mood, text, createdAt, syncStatus',
      syncQueue: '++id, type, payload, createdAt, retryCount'
    });
  }
}

export const offlineDB = new OfflineDB();