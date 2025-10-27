import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const categories = ["Mental Health", "Productivity", "Learning", "Career", "Wellness", "Other"];

const Content = () => {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "Mental Health",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredResources(resources);
    } else {
      setFilteredResources(resources.filter(r => r.category === selectedCategory));
    }
  }, [selectedCategory, resources]);

  const fetchResources = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/resources");
      setResources(res.data);
      setFilteredResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/resources",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources([res.data, ...resources]);
      setFormData({ title: "", description: "", url: "", category: "Mental Health" });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add resource");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(resources.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete resource");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Content Hub</h1>
      <p>Discover and share helpful resources</p>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedCategory("All")}
          style={{
            padding: "8px 16px",
            backgroundColor: selectedCategory === "All" ? "#4CAF50" : "#f0f0f0",
            color: selectedCategory === "All" ? "white" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedCategory === cat ? "#4CAF50" : "#f0f0f0",
              color: selectedCategory === cat ? "white" : "#333",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {showForm ? "Cancel" : "Add Resource"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
          <input
            type="text"
            placeholder="Resource Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <input
            type="url"
            placeholder="Resource URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Add Resource
          </button>
        </form>
      )}

      <div style={{ marginTop: "30px" }}>
        <h2>{selectedCategory === "All" ? "All Resources" : selectedCategory}</h2>
        {filteredResources.length === 0 ? (
          <p>No resources in this category yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {filteredResources.map((resource) => (
              <div key={resource.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "5px", backgroundColor: "#fff" }}>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <p>
                  <span style={{ 
                    backgroundColor: "#e3f2fd", 
                    padding: "4px 8px", 
                    borderRadius: "3px", 
                    fontSize: "12px",
                    color: "#1976d2"
                  }}>
                    {resource.category}
                  </span>
                </p>
                <p>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2196F3", textDecoration: "none", fontWeight: "bold" }}>
                    Visit Resource →
                  </a>
                </p>
                <small style={{ color: "#666" }}>
                  Added by <strong>{resource.author.username}</strong> on {new Date(resource.createdAt).toLocaleString()}
                </small>

                {user && resource.authorId === user.id && (
                  <button
                    onClick={() => handleDelete(resource.id)}
                    style={{
                      marginLeft: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;