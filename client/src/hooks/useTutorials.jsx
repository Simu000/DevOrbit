import { useState, useEffect } from "react";
import axios from "axios";
import { useIndexedDB } from "./useIndexedDB";
import { useSyncQueue } from "./useSyncQueue";

const useTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Offline DB for tutorials
  const { 
    data: offlineTutorials, 
    addItem: addOfflineTutorial,
    updateItem: updateOfflineTutorial,
    deleteItem: deleteOfflineTutorial,
    refresh: refreshOfflineTutorials
  } = useIndexedDB('tutorials');
  
  // Sync queue for offline operations
  const { addToQueue, isOnline } = useSyncQueue();

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        // Try to fetch from API first
        const res = await axios.get("http://localhost:3000/api/tutorials");
        const visibleTutorials = res.data.filter(t => t.isPublic);
        setTutorials(visibleTutorials);
        setError(null);
        
        // Cache in IndexedDB
        await refreshOfflineTutorials();
        for (const tutorial of visibleTutorials) {
          try {
            await addOfflineTutorial(tutorial);
          } catch (err) {
            // Might already exist, try update
            await updateOfflineTutorial(tutorial.id, tutorial);
          }
        }
      } else {
        // Use offline data
        setTutorials(offlineTutorials);
        console.log('Using offline tutorials:', offlineTutorials.length);
      }
    } catch (err) {
      console.error("Error fetching tutorials:", err);
      
      // Fallback to offline data
      if (offlineTutorials.length > 0) {
        setTutorials(offlineTutorials);
        setError("Using cached data - you're offline");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const rateTutorial = async (tutorialId, rating, comment = "") => {
    try {
      if (isOnline) {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `http://localhost:3000/api/tutorials/${tutorialId}/rate`,
          { value: rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await fetchTutorials();
        return res.data;
      } else {
        // Queue for sync when online
        await addToQueue('rate_tutorial', {
          tutorialId,
          value: rating,
          comment
        });
        
        // Update local state optimistically
        const updatedTutorials = tutorials.map(t => 
          t.id === tutorialId 
            ? { 
                ...t, 
                averageRating: ((t.averageRating || 0) + rating) / 2,
                userRating: rating 
              }
            : t
        );
        setTutorials(updatedTutorials);
        
        return { message: "Rating queued for sync" };
      }
    } catch (err) {
      console.error("Error rating tutorial:", err);
      throw err;
    }
  };

  const reportTutorial = async (tutorialId, reason, details = "") => {
    try {
      if (isOnline) {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `http://localhost:3000/api/reports/${tutorialId}/report`,
          { reason, details },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert("Tutorial reported successfully. Our team will review it.");
        return res.data;
      } else {
        // Can't report while offline
        throw new Error("Reporting requires internet connection");
      }
    } catch (err) {
      console.error("Error reporting tutorial:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
      throw err;
    }
  };

  // Add offline tutorial creation
  const createTutorialOffline = async (tutorialData) => {
    try {
      // Add to offline DB first
      const offlineTutorial = {
        ...tutorialData,
        id: Date.now(), // Temporary ID
        isPublic: false,
        views: 0,
        averageRating: 0,
        flagCount: 0,
        createdAt: new Date(),
        syncStatus: 'pending',
        isOffline: true
      };
      
      await addOfflineTutorial(offlineTutorial);
      
      // Add to sync queue
      await addToQueue('create_tutorial', tutorialData);
      
      // Update local state
      setTutorials(prev => [offlineTutorial, ...prev]);
      
      return { 
        message: "Tutorial saved offline and queued for sync",
        tutorial: offlineTutorial 
      };
    } catch (err) {
      console.error("Error creating offline tutorial:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [isOnline]);

  return {
    tutorials,
    loading,
    error,
    fetchTutorials,
    rateTutorial,
    reportTutorial,
    createTutorialOffline,
    isOnline
  };
};

export default useTutorials;