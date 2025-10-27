import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import ReputationBadge from "../components/ReputationBadge";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalTutorials: 0,
    myTutorials: 0,
    totalUsers: 0,
    myReputation: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch tutorials count
        const tutorialsRes = await axios.get("http://localhost:3000/api/tutorials");
        const myTutorials = tutorialsRes.data.filter(t => t.authorId === user?.id);
        
        // Fetch users count
        const usersRes = await axios.get("http://localhost:3000/api/users");
        
        // Fetch recent activity
        let recentActivity = [];
        if (user) {
          try {
            const activityRes = await axios.get(
              `http://localhost:3000/api/reputation/activity/${user.id}?limit=5`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            recentActivity = activityRes.data;
          } catch (err) {
            console.error("Error fetching activity:", err);
          }
        }
        
        setStats({
          totalTutorials: tutorialsRes.data.length,
          myTutorials: myTutorials.length,
          totalUsers: usersRes.data.length,
          myReputation: user?.reputation || 0,
          recentActivity,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
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

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-primary)" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh"
    }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ 
          color: "var(--text-primary)", 
          marginBottom: "10px",
          fontSize: "32px"
        }}>
          Welcome back, {user?.username}! 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
          Here's what's happening in your DevOrbit journey
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "40px"
      }}>
        {/* Reputation Card */}
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🏆</div>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", opacity: 0.9 }}>
            Your Reputation
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
            {stats.myReputation}
          </p>
          <div style={{ marginTop: "15px" }}>
            <ReputationBadge user={user} showPoints={false} size="small" />
          </div>
        </div>

        {/* My Tutorials Card */}
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>📚</div>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", opacity: 0.9 }}>
            My Tutorials
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
            {stats.myTutorials}
          </p>
          <Link 
            to="/tutorials" 
            style={{ 
              color: "white", 
              textDecoration: "none",
              fontSize: "14px",
              opacity: 0.9
            }}
          >
            View all →
          </Link>
        </div>

        {/* Total Tutorials Card */}
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🌐</div>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", opacity: 0.9 }}>
            Total Tutorials
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
            {stats.totalTutorials}
          </p>
          <span style={{ fontSize: "14px", opacity: 0.9 }}>
            Community contributed
          </span>
        </div>

        {/* Community Card */}
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", opacity: 0.9 }}>
            Community Members
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0" }}>
            {stats.totalUsers}
          </p>
          <Link 
            to="/leaderboard" 
            style={{ 
              color: "white", 
              textDecoration: "none",
              fontSize: "14px",
              opacity: 0.9
            }}
          >
            View leaderboard →
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            color: "var(--text-primary)", 
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "20px"
          }}>
            ⚡ Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link
              to="/tutorials/create"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "15px",
                backgroundColor: "#4CAF50",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <span style={{ fontSize: "24px" }}>➕</span>
              <span>Create New Tutorial</span>
            </Link>

            <Link
              to="/tutorials"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "15px",
                backgroundColor: "#2196F3",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <span style={{ fontSize: "24px" }}>🔍</span>
              <span>Browse Tutorials</span>
            </Link>

            <Link
              to="/leaderboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "15px",
                backgroundColor: "#FF9800",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <span style={{ fontSize: "24px" }}>🏆</span>
              <span>View Leaderboard</span>
            </Link>

            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "15px",
                backgroundColor: "#9C27B0",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <span style={{ fontSize: "24px" }}>👤</span>
              <span>View Profile</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            color: "var(--text-primary)", 
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "20px"
          }}>
            📊 Recent Activity
          </h2>
          {stats.recentActivity.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
              No recent activity. Start creating tutorials to earn reputation!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <span style={{ fontSize: "24px" }}>
                    {getActivityIcon(activity.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: 0, 
                      color: "var(--text-primary)",
                      fontSize: "14px"
                    }}>
                      {activity.details}
                    </p>
                    <small style={{ color: "var(--text-secondary)" }}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <span style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    +{activity.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {user && (
        <div style={{
          backgroundColor: "var(--card-bg)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            color: "var(--text-primary)", 
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "20px"
          }}>
            🎯 Your Progress
          </h2>
          
          {user.reputation < 50 ? (
            <div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>
                You need <strong>{50 - user.reputation} more points</strong> to reach Contributor level and post publicly.
              </p>
              <div style={{
                height: "20px",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "10px"
              }}>
                <div style={{
                  height: "100%",
                  width: `${(user.reputation / 50) * 100}%`,
                  backgroundColor: "#4CAF50",
                  transition: "width 0.3s"
                }}></div>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                {user.reputation} / 50 points ({Math.round((user.reputation / 50) * 100)}%)
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ fontSize: "48px", margin: "0 0 10px 0" }}>🎉</p>
              <p style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: "bold" }}>
                Congratulations! You can post publicly now!
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                Keep contributing to reach higher levels
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;