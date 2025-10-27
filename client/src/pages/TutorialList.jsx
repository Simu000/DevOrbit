import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import TutorialCard from "../components/TutorialCard.jsx";
import useTutorials from "../hooks/useTutorials.jsx";

const TutorialList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { tutorials, loading, fetchTutorials } = useTutorials();
  
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const categories = ["All", "Web Dev", "Mobile", "DevOps", "AI/ML", "Data Science", "General"];

  // Filter and sort tutorials
  const getFilteredTutorials = () => {
    let filtered = [...tutorials];

    // Apply category filter
    if (filter !== "all") {
      filtered = filtered.filter(t => t.category === filter);
    }

    // Apply sorting
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  };

  const filteredTutorials = getFilteredTutorials();

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading tutorials...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px", 
          flexWrap: "wrap", 
          gap: "15px" 
        }}
      >
        <h1>📚 Tutorials</h1>
        <button 
          onClick={() => navigate("/tutorials/create")} 
          style={{ 
            padding: "10px 20px", 
            cursor: "pointer", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          ➕ Create Tutorial
        </button>
      </div>

      {/* Filters & Sorting */}
      <div 
        style={{ 
          marginBottom: "30px", 
          padding: "20px", 
          backgroundColor: "var(--card-bg, #f9f9f9)", 
          borderRadius: "10px",
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >
        {/* Category Filter */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Category:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid var(--border-color, #ccc)",
              backgroundColor: "var(--input-bg, white)",
              color: "var(--text-primary, #333)"
            }}
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== "All").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid var(--border-color, #ccc)",
              backgroundColor: "var(--input-bg, white)",
              color: "var(--text-primary, #333)"
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {/* Tutorial Count */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
          <div 
            style={{ 
              padding: "10px 15px", 
              backgroundColor: "var(--info-bg, #e3f2fd)",
              borderRadius: "5px",
              fontSize: "14px"
            }}
          >
            <strong>{filteredTutorials.length}</strong> tutorials
          </div>
        </div>
      </div>

      {/* Tutorial Grid */}
      {filteredTutorials.length === 0 ? (
        <div 
          style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            backgroundColor: "var(--card-bg, #f9f9f9)",
            borderRadius: "10px"
          }}
        >
          <h2>No tutorials found</h2>
          <p style={{ color: "var(--text-secondary, #666)" }}>
            Be the first to create a tutorial in this category!
          </p>
          <button 
            onClick={() => navigate("/tutorials/create")}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Create Tutorial
          </button>
        </div>
      ) : (
        <div 
          style={{ 
            display: "grid", 
            gap: "20px", 
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" 
          }}
        >
          {filteredTutorials.map((tutorial) => (
            <div key={tutorial.id} style={{ position: "relative" }}>
              {/* 🆕 Beginner Badge */}
              {tutorial.flagCount === -1 && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backgroundColor: "#FF9800",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                  }}
                >
                  🆕 Beginner
                </span>
              )}

              {/* Tutorial Card */}
              <TutorialCard 
                tutorial={tutorial} 
                currentUser={user}
                onUpdate={fetchTutorials}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialList;
