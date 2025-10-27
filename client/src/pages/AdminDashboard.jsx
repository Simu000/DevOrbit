import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [hiddenTutorials, setHiddenTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "moderator") {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [reportsRes, usersRes, tutorialsRes] = await Promise.all([
        axios.get("http://localhost:3000/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3000/api/users"),
        axios.get("http://localhost:3000/api/tutorials"),
      ]);

      setReports(reportsRes.data);
      setUsers(usersRes.data);
      setHiddenTutorials(tutorialsRes.data.filter(t => !t.isPublic));
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/reports/${reportId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
      alert("Report approved and tutorial hidden");
    } catch (err) {
      alert("Error approving report");
    }
  };

  const handleRejectReport = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/reports/${reportId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
      alert("Report rejected");
    } catch (err) {
      alert("Error rejecting report");
    }
  };

  const handleRestoreTutorial = async (tutorialId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/reports/${tutorialId}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
      alert("Tutorial restored");
    } catch (err) {
      alert("Error restoring tutorial");
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading admin dashboard...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🛡️ Admin Dashboard</h1>
      
      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid var(--border-color)" }}>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "reports" ? "#4CAF50" : "transparent",
            color: activeTab === "reports" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🚩 Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "users" ? "#4CAF50" : "transparent",
            color: activeTab === "users" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          👥 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("hidden")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "hidden" ? "#4CAF50" : "transparent",
            color: activeTab === "hidden" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "5px 5px 0 0",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📝 Hidden Tutorials ({hiddenTutorials.length})
        </button>
      </div>

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div>
          <h2>Pending Reports</h2>
          {reports.length === 0 ? (
            <p>No pending reports. Great job! 🎉</p>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: "15px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "5px",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 10px 0" }}>
                        Tutorial: {report.tutorial?.title || "Unknown"}
                      </h4>
                      <p><strong>Reason:</strong> {report.reason}</p>
                      {report.details && <p><strong>Details:</strong> {report.details}</p>}
                      <p><strong>Reported by:</strong> {report.user?.username || "Unknown"}</p>
                      <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> {report.status}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleApproveReport(report.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Approve & Hide
                      </button>
                      <button
                        onClick={() => handleRejectReport(report.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <h2>User Management</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  padding: "15px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "5px",
                  backgroundColor: "var(--card-bg)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{user.username}</strong> - {user.email}
                  <br />
                  <small>
                    Reputation: {user.reputation} | Level: {user.level} | Role: {user.role}
                  </small>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {user.role === "user" && (
                    <button
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Make Moderator
                    </button>
                  )}
                  <button
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    View Activity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Tutorials Tab */}
      {activeTab === "hidden" && (
        <div>
          <h2>Hidden Tutorials</h2>
          {hiddenTutorials.length === 0 ? (
            <p>No hidden tutorials.</p>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {hiddenTutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  style={{
                    padding: "15px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "5px",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 10px 0" }}>{tutorial.title}</h4>
                      <p>{tutorial.description}</p>
                      <p><strong>Author:</strong> {tutorial.author?.username || "Unknown"}</p>
                      <p><strong>Flag Count:</strong> {tutorial.flagCount}</p>
                      <p><strong>Hidden since:</strong> {new Date(tutorial.updatedAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreTutorial(tutorial.id)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;