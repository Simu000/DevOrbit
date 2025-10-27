import { create } from "zustand";
import api from "./api.js"; // Use your configured api instance

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

  // Update and delete functions similarly...
}));