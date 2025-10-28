import { create } from "zustand";
import { api } from "../services/api"; // Use your configured api instance

const useJournalStore = create((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  // Fetch entries from backend
  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/journal");
      
      // Ensure entries is always an array
      const data = res.data;
      if (Array.isArray(data)) {
        set({ entries: data, loading: false });
      } else if (data && Array.isArray(data.entries)) {
        set({ entries: data.entries, loading: false });
      } else {
        console.error("Unexpected journal fetch response, expected array:", data);
        set({ entries: [], loading: false });
      }
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      set({ 
        error: err.response?.data?.message || err.message || "Failed to fetch entries",
        loading: false 
      });
    }
  },

  // Add new entry
  addEntry: async (entryData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/journal", entryData);
      
      // Add new entry to the beginning of the list
      set({ 
        entries: [res.data, ...get().entries],
        loading: false 
      });
      
      return res.data;
    } catch (err) {
      console.error("Error adding journal entry:", err);
      set({ 
        error: err.response?.data?.message || err.message || "Failed to add entry",
        loading: false 
      });
      throw err;
    }
  },

  // Update entry
  updateEntry: async (id, entryData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/api/journal/${id}`, entryData);
      
      // Update the entry in the list
      set({ 
        entries: get().entries.map(entry => 
          entry.id === id ? res.data : entry
        ),
        loading: false 
      });
      
      return res.data;
    } catch (err) {
      console.error("Error updating journal entry:", err);
      set({ 
        error: err.response?.data?.message || err.message || "Failed to update entry",
        loading: false 
      });
      throw err;
    }
  },

  // Delete entry
  deleteEntry: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/journal/${id}`);
      
      // Remove the entry from the list
      set({ 
        entries: get().entries.filter(entry => entry.id !== id),
        loading: false 
      });
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      set({ 
        error: err.response?.data?.message || err.message || "Failed to delete entry",
        loading: false 
      });
      throw err;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

// Add default export
export default useJournalStore;