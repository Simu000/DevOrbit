import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import FileUpload from "../components/FileUpload.jsx";
// import { useTutorials } from "../hooks/useTutorials";
// import { createTutorialOffline } from "../utils/offlineDB.js"; // ❌ removed for build fix

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

  // const handleCreateOffline = async (tutorialData) => {
  //   try {
  //     await createTutorialOffline(tutorialData);
  //     alert("📱 Tutorial saved offline! It will sync when you're back online.");
  //     navigate("/tutorials");
  //   } catch (err) {
  //     setError("Failed to save tutorial offline: " + err.message);
  //   }
  // };

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
        alert("✅ Tutorial created successfully!");
        navigate("/tutorials");
      } else {
        // ⚙️ OFFLINE: temporarily disabled for production build
        alert("📴 You are offline. Tutorial saving is disabled in this build.");
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Title */}
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter tutorial title"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter tutorial description"
          rows="4"
          required
        />

        {/* Category */}
        <select name="category" value={formData.category} onChange={handleChange}>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Tags */}
        <div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
          />
          <button onClick={handleAddTag}>Add Tag</button>
          <div style={{ marginTop: "10px" }}>
            {formData.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  marginRight: "8px",
                  padding: "5px 10px",
                  backgroundColor: "#eee",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ❌
              </span>
            ))}
          </div>
        </div>

        {/* Video Upload */}
        <FileUpload onFileUpload={setUploadedVideo} />

        {/* Video URL */}
        <input
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="Enter video URL"
        />

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Tutorial"}
        </button>
      </form>
    </div>
  );
};

export default CreateTutorial;
