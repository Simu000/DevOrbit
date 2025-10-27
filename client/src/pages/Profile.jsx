import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import ReputationBadge from "../components/ReputationBadge";
import axios from "axios";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [myTutorials, setMyTutorials] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutorials"); // tutorials, badges, activity

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");

        // Fetch user reputation data
        const reputationRes = await axios.get(
          "http://localhost:3000/api/reputation/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(reputationRes.data);
        setBadges(reputationRes.data.badges || []);
        setActivities(reputationRes.data.activities || []);

        // Fetch user's tutorials
        const tutorialsRes = await axios.get(
          "http://localhost:3000/api/tutorials"
        );
        const userTutorials = tutorialsRes.data.filter(
          (t) => t.authorId === user.id
        );
        setMyTutorials(userTutorials);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const getActivityIcon = (type) => {
    const icons = {
      tutorial_created: "📝",
      gave_rating: "⭐",
      received_rating: "🌟",
      helpful_rating: "💯",
      tutorial_viewed: "👁️",
    };
    return icons[type] || "📌";
  };

  if (!user) {
    return (
      <p style={{ padding: "20px", color: "var(--text-primary)" }}>
        Loading...
      </p>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "var(--text-primary)",
        }}
      >
        Loading profile...
      </div>
    );
  }

  const levelProgress = userData?.levelProgress || {
    current: user.level,
    next: "Contributor",
    progress: 0,
    pointsToNext: 50,
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "var(--bg-primary)",
        minHeight: "100vh",
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          padding: "30px",
          borderRadius: "15px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "30px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              border: "4px solid rgba(255,255,255,0.3)",
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          {/* User Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "32px" }}>
              {user.username}
            </h1>
            <p style={{ margin: "0 0 15px 0", opacity: 0.9, fontSize: "16px" }}>
              {user.email}
            </p>
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <ReputationBadge user={user} size="large" />
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                🎯 {user.reputation} Points
              </div>
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                📚 {myTutorials.length} Tutorials
              </div>
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                🏆 {badges.length} Badges
              </div>
            </div>
          </div>
          {/* Quick Actions */}
         
          <Link
            to="/settings"
            style={{
              padding: "12px 24px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              border: "2px solid rgba(255,255,255,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
            }}
          >
            ⚙️ Settings
          </Link>
        </div>

        {/* Level Progress Bar */}
        {levelProgress.current !== "Master" && (
          <div style={{ marginTop: "25px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              <span>Progress to {levelProgress.next}</span>
              <span>{levelProgress.pointsToNext} points to go</span>
            </div>
            <div
              style={{
                height: "12px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${levelProgress.progress}%`,
                  backgroundColor: "white",
                  transition: "width 0.3s",
                  borderRadius: "6px",
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setActiveTab("tutorials")}
          style={{
            padding: "10px 20px",
            backgroundColor:
              activeTab === "tutorials" ? "#4CAF50" : "transparent",
            color: activeTab === "tutorials" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          📚 My Tutorials ({myTutorials.length})
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "badges" ? "#4CAF50" : "transparent",
            color: activeTab === "badges" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          🏆 Badges ({badges.length})
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          style={{
            padding: "10px 20px",
            backgroundColor:
              activeTab === "activity" ? "#4CAF50" : "transparent",
            color: activeTab === "activity" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          📊 Activity ({activities.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tutorials" && (
        <div>
          {myTutorials.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "var(--card-bg)",
                borderRadius: "12px",
                border: "2px dashed var(--border-color)",
              }}
            >
              <p style={{ fontSize: "48px", marginBottom: "15px" }}>📝</p>
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}
              >
                No tutorials yet
              </p>
              <p
                style={{ color: "var(--text-secondary)", marginBottom: "20px" }}
              >
                Share your knowledge with the community!
              </p>
              <Link
                to="/tutorials/create"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Create Tutorial
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {myTutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ color: "var(--text-primary)", marginTop: 0 }}>
                    {tutorial.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "14px",
                      marginBottom: "15px",
                    }}
                  >
                    {tutorial.description.substring(0, 100)}...
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "15px",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>👁️ {tutorial.views} views</span>
                    <span>
                      ⭐ {tutorial.averageRating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link
                      to={`/tutorials/edit/${tutorial.id}`}
                      style={{
                        flex: 1,
                        padding: "8px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "5px",
                        textAlign: "center",
                        fontSize: "14px",
                      }}
                    >
                      Edit
                    </Link>
                    <a
                      href={tutorial.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: "8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "5px",
                        textAlign: "center",
                        fontSize: "14px",
                      }}
                    >
                      View
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
          {badges.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "var(--card-bg)",
                borderRadius: "12px",
                border: "2px dashed var(--border-color)",
              }}
            >
              <p style={{ fontSize: "48px", marginBottom: "15px" }}>🏆</p>
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}
              >
                No badges earned yet
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                Keep contributing to earn badges!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    padding: "25px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "64px", marginBottom: "15px" }}>
                    {badge.icon}
                  </div>
                  <h3
                    style={{
                      color: "var(--text-primary)",
                      marginTop: 0,
                      marginBottom: "10px",
                      fontSize: "18px",
                    }}
                  >
                    {badge.name}
                  </h3>
                  {badge.description && (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      {badge.description}
                    </p>
                  )}
                  <small style={{ color: "var(--text-secondary)" }}>
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div>
          {activities.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "var(--card-bg)",
                borderRadius: "12px",
                border: "2px dashed var(--border-color)",
              }}
            >
              <p style={{ fontSize: "48px", marginBottom: "15px" }}>📊</p>
              <p
                style={{
                  fontSize: "18px",
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}
              >
                No activity yet
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                Start contributing to build your activity timeline!
              </p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "var(--card-bg)",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  paddingLeft: "40px",
                }}
              >
                {/* Timeline Line */}
                <div
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "10px",
                    bottom: "10px",
                    width: "2px",
                    backgroundColor: "var(--border-color)",
                  }}
                ></div>

                {activities.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      marginBottom: "25px",
                      paddingBottom: "25px",
                      borderBottom:
                        index < activities.length - 1
                          ? "1px solid var(--border-color)"
                          : "none",
                    }}
                  >
                    {/* Timeline Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-28px",
                        top: "5px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#4CAF50",
                        border: "3px solid var(--bg-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            color: "var(--text-primary)",
                            fontWeight: "500",
                          }}
                        >
                          {activity.details}
                        </p>
                        <small style={{ color: "var(--text-secondary)" }}>
                          {new Date(activity.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <span
                        style={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          marginLeft: "15px",
                        }}
                      >
                        +{activity.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
