import { useState, useEffect, useCallback } from 'react';
import { offlineDB } from '../utils/offlineDB';

export const useSyncQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queue, setQueue] = useState([]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync queue from IndexedDB
  const loadQueue = useCallback(async () => {
    try {
      const items = await offlineDB.syncQueue.toArray();
      setQueue(items);
    } catch (err) {
      console.error('Error loading sync queue:', err);
    }
  }, []);

  // Add operation to sync queue
  const addToQueue = useCallback(async (type, payload) => {
    try {
      const queueItem = {
        type,
        payload,
        createdAt: new Date(),
        retryCount: 0,
        syncStatus: 'pending'
      };

      await offlineDB.syncQueue.add(queueItem);
      await loadQueue();
      
      // Try to sync immediately if online
      if (isOnline) {
        processQueue();
      }
    } catch (err) {
      console.error('Error adding to sync queue:', err);
      throw err;
    }
  }, [isOnline, loadQueue]);

  // Process sync queue
  const processQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    
    try {
      const pendingItems = await offlineDB.syncQueue
        .where('syncStatus')
        .equals('pending')
        .toArray();

      for (const item of pendingItems) {
        try {
          // Simulate API calls - replace with actual API endpoints
          let success = false;
          
          switch (item.type) {
            case 'create_tutorial':
              // await axios.post('/api/tutorials', item.payload);
              success = true;
              break;
            case 'create_journal':
              // await axios.post('/api/journal', item.payload);
              success = true;
              break;
            case 'send_message':
              // await axios.post('/api/chat/messages', item.payload);
              success = true;
              break;
            case 'rate_tutorial':
              // await axios.post(`/api/tutorials/${item.payload.tutorialId}/rate`, item.payload);
              success = true;
              break;
            default:
              console.warn('Unknown sync type:', item.type);
          }

          if (success) {
            // Mark as synced
            await offlineDB.syncQueue.update(item.id, { 
              syncStatus: 'synced',
              syncedAt: new Date()
            });
          } else {
            // Increment retry count
            const newRetryCount = item.retryCount + 1;
            await offlineDB.syncQueue.update(item.id, { 
              retryCount: newRetryCount,
              ...(newRetryCount >= 3 && { syncStatus: 'failed' })
            });
          }
        } catch (err) {
          console.error(`Error syncing item ${item.id}:`, err);
          const newRetryCount = item.retryCount + 1;
          await offlineDB.syncQueue.update(item.id, { 
            retryCount: newRetryCount,
            ...(newRetryCount >= 3 && { syncStatus: 'failed' })
          });
        }
      }

      await loadQueue();
    } catch (err) {
      console.error('Error processing sync queue:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadQueue]);

  // Retry failed items
  const retryFailed = useCallback(async () => {
    try {
      await offlineDB.syncQueue
        .where('syncStatus')
        .equals('failed')
        .modify({ syncStatus: 'pending', retryCount: 0 });
      
      await loadQueue();
      processQueue();
    } catch (err) {
      console.error('Error retrying failed items:', err);
    }
  }, [processQueue, loadQueue]);

  // Clear synced items
  const clearSynced = useCallback(async () => {
    try {
      await offlineDB.syncQueue
        .where('syncStatus')
        .equals('synced')
        .delete();
      
      await loadQueue();
    } catch (err) {
      console.error('Error clearing synced items:', err);
    }
  }, [loadQueue]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline, queue.length, processQueue]);

  // Load queue on mount
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    isOnline,
    isSyncing,
    queue,
    addToQueue,
    processQueue,
    retryFailed,
    clearSynced,
    refreshQueue: loadQueue
  };
};