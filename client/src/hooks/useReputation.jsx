import { useState, useEffect } from "react";
import axios from "axios";

const useReputation = (userId = null) => {
  const [reputationData, setReputationData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReputation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = userId 
        ? `http://localhost:3000/api/reputation/user/${userId}`
        : "http://localhost:3000/api/reputation/me";
      
      const res = await axios.get(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      setReputationData(res.data);
    } catch (err) {
      console.error("Error fetching reputation:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (limit = 10) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/reputation/leaderboard?limit=${limit}`
      );
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      Beginner: "#9E9E9E",
      Contributor: "#4CAF50",
      Expert: "#2196F3",
      Master: "#FFD700",
    };
    return colors[level] || "#9E9E9E";
  };

  const getLevelIcon = (level) => {
    const icons = {
      Beginner: "🌱",
      Contributor: "🌿",
      Expert: "🌳",
      Master: "👑",
    };
    return icons[level] || "⭐";
  };

  useEffect(() => {
    fetchReputation();
    fetchLeaderboard();
  }, [userId]);

  return {
    reputationData,
    leaderboard,
    loading,
    fetchReputation,
    fetchLeaderboard,
    getLevelColor,
    getLevelIcon,
  };
};

export default useReputation;