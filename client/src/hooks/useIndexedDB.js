import { useState, useEffect, useCallback } from 'react';
import { offlineDB } from '../utils/offlineDB';

export const useIndexedDB = (tableName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const items = await offlineDB[tableName].toArray();
      setData(items);
      setError(null);
    } catch (err) {
      console.error(`Error loading ${tableName} from IndexedDB:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Add item to IndexedDB
  const addItem = useCallback(async (item) => {
    try {
      const id = await offlineDB[tableName].add(item);
      await loadData(); // Refresh data
      return id;
    } catch (err) {
      console.error(`Error adding to ${tableName}:`, err);
      setError(err.message);
      throw err;
    }
  }, [tableName, loadData]);

  // Update item in IndexedDB
  const updateItem = useCallback(async (id, changes) => {
    try {
      await offlineDB[tableName].update(id, changes);
      await loadData(); // Refresh data
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err);
      setError(err.message);
      throw err;
    }
  }, [tableName, loadData]);

  // Delete item from IndexedDB
  const deleteItem = useCallback(async (id) => {
    try {
      await offlineDB[tableName].delete(id);
      await loadData(); // Refresh data
    } catch (err) {
      console.error(`Error deleting from ${tableName}:`, err);
      setError(err.message);
      throw err;
    }
  }, [tableName, loadData]);

  // Clear all data from table
  const clearTable = useCallback(async () => {
    try {
      await offlineDB[tableName].clear();
      await loadData();
    } catch (err) {
      console.error(`Error clearing ${tableName}:`, err);
      setError(err.message);
      throw err;
    }
  }, [tableName, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    clearTable,
    refresh: loadData
  };
};