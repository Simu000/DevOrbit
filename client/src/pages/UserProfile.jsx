import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import ReputationBadge from "../components/ReputationBadge.jsx";

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [userTutorials, setUserTutorials] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutorials");

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const [userRes, tutorialsRes, badgesRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/reputation/user/${id}`),
        axios.get("http://localhost:3000/api/tutorials"),
        axios.get(`http://localhost:3000/api/reputation/badges/${id}`),
      ]);

      setProfileUser(userRes.data.user);
      setUserBadges(badgesRes.data);
      
      // Filter tutorials by this user
      const userTutorials = tutorialsRes.data.filter(t => 
        t.authorId === parseInt(id) && t.isPublic
      );
      setUserTutorials(userTutorials);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser && currentUser.id === parseInt(id);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>User not found</h2>
        <p>The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: "var(--card-bg)",
        padding: "30px",
        borderRadius: "15px",
        border: "1px solid var(--border-color)",
        marginBottom: "30px",
        textAlign: "center"
      }}>
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "#e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          margin: "0 auto 20px auto"
        }}>
          {profileUser.avatar ? (
            <img 
              src={profileUser.avatar} 
              alt={profileUser.username}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            profileUser.username.charAt(0).toUpperCase()
          )}
        </div>

        <h1 style={{ margin: "0 0 10px 0" }}>{profileUser.username}</h1>
        <div style={{ marginBottom: "15px" }}>
          <ReputationBadge user={profileUser} size="large" />
        </div>
        <p style={{ color: "var(--text-secondary)", margin: "0" }}>
          {profileUser.email}
        </p>

        {isOwnProfile && (
          <div style={{ marginTop: "20px" }}>
            <Link
              to="/profile"
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196F3",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                fontWeight: "bold"
              }}
            >
              Edit My Profile
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        borderBottom: "2px solid var(--border-color)"
      }}>
        <button
          onClick={() => setActiveTab("tutorials")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "tutorials" ? "#4CAF50" : "transparent",
            color: activeTab === "tutorials" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          📚 Tutorials ({userTutorials.length})
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "badges" ? "#4CAF50" : "transparent",
            color: activeTab === "badges" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🏆 Badges ({userBadges.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tutorials" && (
        <div>
          {userTutorials.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "48px", marginBottom: "10px" }}>📝</p>
              <p>No public tutorials yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {userTutorials.map(tutorial => (
                <div
                  key={tutorial.id}
                  style={{
                    padding: "20px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    backgroundColor: "var(--card-bg)"
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>{tutorial.title}</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>
                    {tutorial.description}
                  </p>
                  <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      ⭐ {tutorial.averageRating?.toFixed(1) || "0.0"}
                    </span>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      👁️ {tutorial.views || 0} views
                    </span>
                    {tutorial.category && (
                      <span style={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}>
                        {tutorial.category}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: "15px" }}>
                    <a
                      href={tutorial.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "5px",
                        fontSize: "14px"
                      }}
                    >
                      Watch Tutorial
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "badges" && (
        <div>
          {userBadges.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              <p style={{ fontSize: "48px", marginBottom: "10px" }}>🏆</p>
              <p>No badges earned yet.</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px" 
            }}>
              {userBadges.map(badge => (
                <div
                  key={badge.id}
                  style={{
                    padding: "20px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    backgroundColor: "var(--card-bg)",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                    {badge.icon}
                  </div>
                  <h4 style={{ margin: "0 0 5px 0" }}>{badge.name}</h4>
                  {badge.description && (
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                      {badge.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;