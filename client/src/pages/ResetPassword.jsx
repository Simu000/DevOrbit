// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError("No reset token provided");
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/auth/verify-reset-token/${token}`);
      setTokenValid(true);
    } catch (err) {
      setTokenValid(false);
      setError("Invalid or expired reset token");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/auth/reset-password", {
        token,
        password
      });

      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div style={{ 
        padding: "40px 20px", 
        maxWidth: "400px", 
        margin: "50px auto",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#d32f2f", marginBottom: "20px" }}>Invalid Reset Link</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
          This password reset link is invalid or has expired.
          Please request a new reset link.
        </p>
        <Link 
          to="/forgot-password"
          style={{ 
            padding: "12px 24px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            textDecoration: "none",
            fontSize: "16px",
            display: "inline-block"
          }}
        >
          Get New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "400px", 
      margin: "50px auto",
      backgroundColor: "var(--bg-secondary)",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Set New Password</h1>

      {message && (
        <div style={{ 
          color: "#4CAF50", 
          padding: "12px", 
          backgroundColor: "#e8f5e8", 
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #4CAF50"
        }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div style={{ 
          color: "#d32f2f", 
          padding: "12px", 
          backgroundColor: "#ffebee", 
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #d32f2f"
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 6 characters)"
            required
            minLength={6}
            style={{ 
              padding: "12px", 
              fontSize: "16px",
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "5px",
              boxSizing: "border-box"
            }}
          />
        </div>
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            style={{ 
              padding: "12px", 
              fontSize: "16px",
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "5px",
              boxSizing: "border-box"
            }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !tokenValid}
          style={{ 
            padding: "12px", 
            cursor: (loading || !tokenValid) ? "not-allowed" : "pointer",
            backgroundColor: (loading || !tokenValid) ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "background-color 0.3s"
          }}
        >
          {loading ? "Resetting Password..." : 
           tokenValid === null ? "Verifying Token..." : 
           "Reset Password"}
        </button>
      </form>

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link 
          to="/login" 
          style={{ 
            color: "#2196F3", 
            textDecoration: "none",
            fontSize: "14px"
          }}
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;