// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
      <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
        <h1>Invalid Reset Link</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
          This password reset link is invalid or has expired.
        </p>
        <button 
          onClick={() => navigate("/forgot-password")}
          style={{ 
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Get New Reset Link
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h1>Set New Password</h1>

      {message && (
        <div style={{ 
          color: "#4CAF50", 
          padding: "10px", 
          backgroundColor: "#e8f5e8", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          color: "red", 
          padding: "10px", 
          backgroundColor: "#ffe6e6", 
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
          style={{ padding: "10px", fontSize: "14px" }}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          style={{ padding: "10px", fontSize: "14px" }}
        />
        <button 
          type="submit" 
          disabled={loading || !tokenValid}
          style={{ 
            padding: "10px", 
            cursor: (loading || !tokenValid) ? "not-allowed" : "pointer",
            backgroundColor: (loading || !tokenValid) ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px"
          }}
        >
          {loading ? "Resetting..." : tokenValid === null ? "Verifying..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;