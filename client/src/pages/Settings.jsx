import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import useTheme from "../hooks/useTheme";
import ReputationBadge from "../components/ReputationBadge.jsx";

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account"); // account, appearance, privacy
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: "",
    avatar: ""
  });

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account API
    alert("Account deletion will be implemented with backend endpoint");
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update API
    alert("Profile update functionality coming soon!");
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1000px", 
      margin: "0 auto",
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ 
          color: "var(--text-primary)", 
          marginBottom: "10px",
          fontSize: "32px"
        }}>
          ⚙️ Settings
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage your account preferences and settings
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        borderBottom: "2px solid var(--border-color)",
        paddingBottom: "10px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setActiveTab("account")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "account" ? "#4CAF50" : "transparent",
            color: activeTab === "account" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          👤 Account
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "appearance" ? "#4CAF50" : "transparent",
            color: activeTab === "appearance" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          🎨 Appearance
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "privacy" ? "#4CAF50" : "transparent",
            color: activeTab === "privacy" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          🔒 Privacy
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "notifications" ? "#4CAF50" : "transparent",
            color: activeTab === "notifications" ? "white" : "var(--text-primary)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          🔔 Notifications
        </button>
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Profile Information Card */}
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
              Profile Information
            </h2>
            
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                      fontSize: "16px"
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: "block", 
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                      fontSize: "16px"
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: "block", 
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell others about yourself..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                      fontSize: "16px",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: "block", 
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    Avatar URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                      fontSize: "16px"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    alignSelf: "flex-start"
                  }}
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Account Status Card */}
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
              Account Status
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold", fontSize: "16px" }}>
                    Reputation Level
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    Your current standing in the community
                  </div>
                </div>
                <ReputationBadge user={user} size="medium" />
              </div>

              <div style={{
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold", fontSize: "16px" }}>
                    Member Since
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
                <span style={{ fontSize: "24px" }}>🎉</span>
              </div>

              <div style={{
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold", fontSize: "16px" }}>
                    Account Role
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    {user?.role === "admin" ? "Administrator" : "Community Member"}
                  </div>
                </div>
                <span style={{ 
                  padding: "6px 12px",
                  backgroundColor: user?.role === "admin" ? "#f44336" : "#2196F3",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {user?.role || "user"}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Change Password
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Password reset functionality will be available soon
            </p>
            <button
              disabled
              style={{
                padding: "12px 24px",
                backgroundColor: "#ccc",
                color: "#666",
                border: "none",
                borderRadius: "8px",
                cursor: "not-allowed",
                fontWeight: "bold"
              }}
            >
              Request Password Reset
            </button>
          </div>

          {/* Logout Card */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Session Management
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Sign out of your account on this device
            </p>
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 24px",
                backgroundColor: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            >
              🚪 Logout
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{
            backgroundColor: "var(--card-bg)",
            padding: "25px",
            borderRadius: "12px",
            border: "2px solid #f44336",
            boxShadow: "0 2px 8px rgba(244, 67, 54, 0.2)"
          }}>
            <h2 style={{ 
              color: "#f44336", 
              marginTop: 0,
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              ⚠️ Danger Zone
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                Delete Account
              </button>
            ) : (
              <div>
                <p style={{ 
                  color: "#f44336", 
                  fontWeight: "bold",
                  marginBottom: "15px"
                }}>
                  Are you absolutely sure? This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Theme Card */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Color Theme
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Choose between light and dark mode
            </p>
            
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <button
                onClick={() => toggleTheme()}
                style={{
                  padding: "15px 30px",
                  backgroundColor: theme === "light" ? "#4CAF50" : "var(--bg-secondary)",
                  color: theme === "light" ? "white" : "var(--text-primary)",
                  border: theme === "light" ? "2px solid #4CAF50" : "2px solid var(--border-color)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.3s ease"
                }}
              >
                ☀️ Light Mode
              </button>
              
              <button
                onClick={() => toggleTheme()}
                style={{
                  padding: "15px 30px",
                  backgroundColor: theme === "dark" ? "#4CAF50" : "var(--bg-secondary)",
                  color: theme === "dark" ? "white" : "var(--text-primary)",
                  border: theme === "dark" ? "2px solid #4CAF50" : "2px solid var(--border-color)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.3s ease"
                }}
              >
                🌙 Dark Mode
              </button>
            </div>
            
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "var(--info-bg)",
              borderRadius: "8px",
              borderLeft: "4px solid #2196F3"
            }}>
              <p style={{ 
                color: "#1976d2", 
                margin: 0,
                fontSize: "14px"
              }}>
                💡 Current theme: <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
              </p>
            </div>
          </div>

          {/* Display Preferences */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Display Preferences
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Customize how DevOrbit looks and feels
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <span style={{ color: "var(--text-primary)" }}>
                  Show tutorial thumbnails
                </span>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <span style={{ color: "var(--text-primary)" }}>
                  Enable animations
                </span>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <span style={{ color: "var(--text-primary)" }}>
                  Compact view mode
                </span>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <span style={{ color: "var(--text-primary)" }}>
                  Show reputation badges everywhere
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Profile Visibility */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Profile Visibility
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Control who can see your profile and activity
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Public profile
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Anyone can view your profile and tutorials
                  </div>
                </div>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Show on leaderboard
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Display your ranking on the public leaderboard
                  </div>
                </div>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Show activity timeline
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Others can see your recent contributions
                  </div>
                </div>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Allow direct messages
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Other users can send you private messages
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data & Privacy */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Data & Privacy
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button
                disabled
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  cursor: "not-allowed",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                📥 Download my data (Coming soon)
              </button>
              
              <button
                disabled
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  cursor: "not-allowed",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                🔒 Privacy Policy (Coming soon)
              </button>
              
              <button
                disabled
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  cursor: "not-allowed",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                📜 Terms of Service (Coming soon)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email Notifications */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              Email Notifications
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Control which emails you receive from DevOrbit
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Weekly digest
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Receive weekly updates about your progress
                  </div>
                </div>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Tutorial interactions
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Get notified when someone rates your tutorial
                  </div>
                </div>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Reputation milestones
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Celebrate when you reach new levels and badges
                  </div>
                </div>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Community announcements
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Important updates about DevOrbit platform
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* In-App Notifications */}
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
              marginBottom: "15px",
              fontSize: "20px"
            }}>
              In-App Notifications
            </h2>
            <p style={{ 
              color: "var(--text-secondary)", 
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              Control notifications within the DevOrbit application
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    New messages
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Notify when you receive new chat messages
                  </div>
                </div>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Support responses
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Notify when someone replies to your support posts
                  </div>
                </div>
              </label>
              
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary)",
                transition: "background-color 0.2s"
              }}>
                <input type="checkbox" defaultChecked disabled />
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "bold" }}>
                    Achievement unlocks
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    Celebrate when you earn new badges and rewards
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;