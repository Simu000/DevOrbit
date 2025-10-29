import { create } from "zustand";
import axios from "axios";

const useJournalStore = create((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  // Fetch entries from backend
  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      // Get token dynamically inside the function
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.get("http://localhost:3000/api/journal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
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
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.post(
        "http://localhost:3000/api/journal", 
        entryData, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
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

  // Update existing entry
  updateEntry: async (id, entryData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.put(
        `http://localhost:3000/api/journal/${id}`, 
        entryData, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update locally
      const current = Array.isArray(get().entries) ? get().entries : [];
      set({
        entries: current.map((e) => 
          e.id === id ? { ...e, ...entryData } : e
        ),
        loading: false
      });
    } catch (err) {
      console.error("Error updating journal entry:", err);
      set({ 
        error: err.response?.data?.message || err.message || "Failed to update entry",
        loading: false 
      });
      throw err;
    }
  },

  // Delete an entry
  deleteEntry: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(`http://localhost:3000/api/journal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const current = Array.isArray(get().entries) ? get().entries : [];
      set({ 
        entries: current.filter((e) => e.id !== id),
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
  clearError: () => set({ error: null }),
}));

export default useJournalStore;