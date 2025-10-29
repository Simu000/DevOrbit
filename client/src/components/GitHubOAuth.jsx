// src/components/GitHubOAuth.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const GitHubOAuth = () => {
  const { user } = useContext(AuthContext);

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/github";
  };

  if (user) {
    return null;
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
      <span>🐱</span>
      Continue with GitHub
    </button>
  );
};

export default GitHubOAuth;