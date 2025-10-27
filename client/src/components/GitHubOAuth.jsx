// src/components/GitHubOAuth.jsx
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const GitHubOAuth = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/github";
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const username = urlParams.get('username');
    const error = urlParams.get('error');

    if (token && username) {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard'; // Refresh to update auth state
    }

    if (error) {
      alert('GitHub authentication failed: ' + error);
    }
  }, []);

  if (user) {
    return null; // Don't show if already logged in
  }

  return (
    <button
      onClick={handleGitHubLogin}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#333",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px"
      }}
    >
      <span>🐙</span>
      Continue with GitHub
    </button>
  );
};

export default GitHubOAuth;