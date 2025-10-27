import { useState, useEffect } from "react";
import axios from "axios";

const useTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/tutorials");
      // Filter out hidden tutorials for non-admins
      const visibleTutorials = res.data.filter(t => t.isPublic);
      setTutorials(visibleTutorials);
      setError(null);
    } catch (err) {
      console.error("Error fetching tutorials:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rateTutorial = async (tutorialId, rating, comment = "") => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3000/api/tutorials/${tutorialId}/rate`,
        { value: rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh tutorials to get updated ratings
      await fetchTutorials();
      return res.data;
    } catch (err) {
      console.error("Error rating tutorial:", err);
      throw err;
    }
  };

  const reportTutorial = async (tutorialId, reason, details = "") => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3000/api/reports/${tutorialId}/report`,
        { reason, details },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Tutorial reported successfully. Our team will review it.");
      return res.data;
    } catch (err) {
      console.error("Error reporting tutorial:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
      throw err;
    }
  };

  const getTutorialRatings = async (tutorialId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/tutorials/${tutorialId}/ratings`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching ratings:", err);
      return [];
    }
  };

  const getMyRating = async (tutorialId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/api/tutorials/${tutorialId}/my-rating`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching user rating:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  return {
    tutorials,
    loading,
    error,
    fetchTutorials,
    rateTutorial,
    reportTutorial,
    getTutorialRatings,
    getMyRating,
  };
};

export default useTutorials;