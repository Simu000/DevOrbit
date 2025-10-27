import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const UpdateTutorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "General",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories = ["General", "Web Dev", "Mobile", "DevOps", "AI/ML", "Data Science"];

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/api/tutorials/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        // Check if user is the author
        if (res.data.authorId !== user?.id) {
          setError("You are not authorized to edit this tutorial");
          setTimeout(() => navigate("/tutorials"), 2000);
          return;
        }

        setFormData({
          title: res.data.title,
          description: res.data.description,
          videoUrl: res.data.videoUrl,
          category: res.data.category || "General",
          tags: res.data.tags || [],
        });
      } catch (err) {
        console.error("Error fetching tutorial:", err);
        setError(err.response?.data?.message || "Failed to load tutorial");
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchTutorial();
    }
  }, [id, user, navigate]);

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
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You must be logged in to update a tutorial");
        setSubmitting(false);
        return;
      }

      console.log("Updating tutorial:", formData);

      await axios.put(
        `http://localhost:3000/api/tutorials/${id}`,
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

      console.log("Tutorial updated successfully");
      alert("✅ Tutorial updated successfully!");
      navigate("/tutorials");
    } catch (err) {
      console.error("Error updating tutorial:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to update tutorial. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center",
        color: "var(--text-primary)" 
      }}>
        Loading tutorial...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh"
    }}>
      <h2 style={{ marginBottom: "10px", color: "var(--text-primary)" }}>
        ✏️ Update Tutorial
      </h2>

      {error && (
        <div style={{ 
          color: "white",
          backgroundColor: "#f44336",
          padding: "15px", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          ❌ {error}
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
            placeholder="Tutorial title"
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

        {/* Video URL */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            Video URL *
          </label>
          <input
            type="url"
            name="videoUrl"
            placeholder="https://youtube.com/watch?v=..."
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
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(e);
                }
              }}
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
                      fontSize: "18px",
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

        {/* Submit Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 30px",
              backgroundColor: submitting ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1
            }}
          >
            {submitting ? "Updating..." : "💾 Update Tutorial"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tutorials")}
            disabled={submitting}
            style={{
              padding: "12px 30px",
              backgroundColor: "#757575",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: submitting ? "not-allowed" : "pointer",
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

export default UpdateTutorial;