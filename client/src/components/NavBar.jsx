import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle";
import ReputationBadge from "./ReputationBadge";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px 20px",
        borderBottom: "2px solid var(--accent-color, #4CAF50)",
        backgroundColor: "var(--nav-bg, #f5f5f5)",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Link
        to="/dashboard"
        style={{
          fontWeight: "bold",
          fontSize: "20px",
          textDecoration: "none",
          color: "var(--text-primary, #333)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🚀 DevOrbit
      </Link>

      {user ? (
        <>
          <Link
            to="/tutorials"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Tutorials
          </Link>
          <Link
            to="/leaderboard"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Leaderboard
          </Link>
          <Link
            to="/focus"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
          Focus Timer
          </Link>
          <Link
            to="/journal"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Journal
          </Link>
          <Link
            to="/mood-analytics"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Analytics
          </Link>
          <Link
            to="/users"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Find Users
          </Link>
          <Link
            to="/chat"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Chat
          </Link>
          <Link
            to="/profile"
            style={{
              textDecoration: "none",
              color: "var(--text-primary, #333)",
            }}
          >
            Profile
          </Link>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <ThemeToggle />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "var(--text-secondary, #666)" }}>
                <strong>{user.username}</strong>
              </span>
              {user.reputation !== undefined && (
                <ReputationBadge user={user} size="small" />
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <ThemeToggle />
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "var(--text-primary, #333)",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;