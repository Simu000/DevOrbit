import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { createTutorialOffline } from "../utils/offlineDB.js"; 
// import { useTutorials } from "../hooks/useTutorials";

const CreateTutorial = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "General",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // 👈 detect online/offline

  const categories = ["General", "Web Dev", "Mobile", "DevOps", "AI/ML", "Data Science"];

  // 👇 update status dynamically
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // 👇 offline fallback function
  const handleCreateOffline = async (tutorialData) => {
    try {
      await createTutorialOffline(tutorialData);
      alert("📱 Tutorial saved offline! It will sync when you're back online.");
      navigate("/tutorials");
    } catch (err) {
      setError("Failed to save tutorial offline: " + err.message);
    }
  };

  // 👇 main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You must be logged in to create a tutorial");
        setLoading(false);
        return;
      }

      if (isOnline) {
        // ✅ ONLINE: send to API
        const response = await axios.post(
          "http://localhost:3000/api/tutorials",
          {
            title: formData.title,
            description: formData.description,
            videoUrl: formData.videoUrl,
            category: formData.category,
            tags: formData.tags,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Tutorial created:", response.data);
        alert("Tutorial created successfully!");
        navigate("/tutorials");
      } else {
        // ⚙️ OFFLINE: store locally
        await handleCreateOffline({
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl,
          category: formData.category,
          tags: formData.tags,
        });
      }
    } catch (err) {
      console.error("Error creating tutorial:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create tutorial. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "var(--bg-primary)",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>Create New Tutorial</h2>

      {/* ⚠️ Offline indicator */}
      {!isOnline && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#FF9800",
            color: "white",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          📱 You’re offline — Tutorial will be saved locally and synced when you’re back online.
        </div>
      )}

      {user?.reputation < 50 && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "var(--info-bg, #e3f2fd)",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #2196F3",
          }}
        >
          <strong>📝 Sandbox Mode:</strong> You need 50+ reputation points to post publicly.
          Your tutorial will be visible only to moderators until you reach Contributor level.
        </div>
      )}

      {error && (
        <div
          style={{
            color: "white",
            backgroundColor: "#f44336",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* title, category, description, upload etc. */}
        {/* --- keep your same inputs and styles --- */}
        {/* 👇 FileUpload and the rest of your existing JSX remains unchanged */}
        {/* (no need to re-paste all, just ensure it's inside this form) */}
        {/* keep your same tag and button sections */}
      </form>
    </div>
  );
};

export default CreateTutorial;
