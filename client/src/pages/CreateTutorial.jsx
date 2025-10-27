import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import FileUpload from "../components/FileUpload.jsx"; // Make sure to import FileUpload

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
  const [uploadedVideo, setUploadedVideo] = useState(null); // Add this state

  const categories = ["General", "Web Dev", "Mobile", "DevOps", "AI/ML", "Data Science"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      // API call with correct endpoint
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
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Tutorial created:", response.data);
      
      // Show success message
      alert("Tutorial created successfully!");
      
      // Navigate to tutorials page
      navigate("/tutorials");
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
    <div style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh"
    }}>
      <h2 style={{ marginBottom: "10px" }}>Create New Tutorial</h2>
      
      {user?.reputation < 50 && (
        <div style={{
          padding: "15px",
          backgroundColor: "var(--info-bg, #e3f2fd)",
          borderRadius: "8px",
          marginBottom: "20px",
          borderLeft: "4px solid #2196F3"
        }}>
          <strong>📝 Sandbox Mode:</strong> You need 50+ reputation points to post publicly. 
          Your tutorial will be visible only to moderators until you reach Contributor level.
        </div>
      )}

      {error && (
        <div style={{ 
          color: "white",
          backgroundColor: "#f44336",
          padding: "15px", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "20px"
      }}>
        {/* Title */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Learn React Hooks in 10 Minutes"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ 
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid var(--border-color, #ccc)",
              backgroundColor: "var(--input-bg, white)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ 
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid var(--border-color, #ccc)",
              backgroundColor: "var(--input-bg, white)",
              color: "var(--text-primary)"
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            Description *
          </label>
          <textarea
            name="description"
            placeholder="Describe what your tutorial covers..."
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            style={{ 
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid var(--border-color, #ccc)",
              backgroundColor: "var(--input-bg, white)",
              color: "var(--text-primary)",
              resize: "vertical"
            }}
          />
        </div>

        {/* Video Upload Section - REPLACED Video URL Input */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            Video Upload *
          </label>
          
          <FileUpload
            onUploadSuccess={(data) => {
              setUploadedVideo(data);
              setFormData(prev => ({ ...prev, videoUrl: data.videoUrl }));
              alert("Video uploaded successfully!");
            }}
            onUploadError={(error) => {
              alert(`Upload failed: ${error}`);
            }}
          />

          {/* Success Message */}
          {uploadedVideo && (
            <div style={{
              marginTop: "15px",
              padding: "15px",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              border: "1px solid #4CAF50"
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>✅ Video Ready!</h4>
              <p style={{ margin: 0, color: "#2e7d32" }}>
                Your video has been uploaded successfully. Duration: {Math.round(uploadedVideo.duration / 60)} minutes
              </p>
            </div>
          )}

          {/* Fallback manual URL input in case upload fails */}
          <div style={{ marginTop: "15px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "normal",
              color: "var(--text-secondary)",
              fontSize: "14px"
            }}>
              Or enter video URL manually:
            </label>
            <input
              type="url"
              name="videoUrl"
              placeholder="https://youtube.com/watch?v=... or https://your-uploaded-video.url"
              value={formData.videoUrl}
              onChange={handleChange}
              required
              style={{ 
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "1px solid var(--border-color, #ccc)",
                backgroundColor: "var(--input-bg, white)",
                color: "var(--text-primary)"
              }}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            Tags (Optional)
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g., react, hooks, tutorial"
              style={{ 
                flex: 1,
                padding: "10px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "1px solid var(--border-color, #ccc)",
                backgroundColor: "var(--input-bg, white)",
                color: "var(--text-primary)"
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Add Tag
            </button>
          </div>

          {/* Display Tags */}
          {formData.tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    padding: "6px 12px",
                    borderRadius: "16px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1976d2",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "0",
                      lineHeight: "1"
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="submit"
            disabled={loading || !formData.videoUrl}
            style={{
              padding: "12px 30px",
              backgroundColor: (loading || !formData.videoUrl) ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: (loading || !formData.videoUrl) ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1
            }}
          >
            {loading ? "Creating..." : "Create Tutorial"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tutorials")}
            style={{
              padding: "12px 30px",
              backgroundColor: "#757575",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTutorial;