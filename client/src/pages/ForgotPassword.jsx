// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/auth/forgot-password", {
        email
      });

      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h1>Reset Your Password</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

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
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{ padding: "10px", fontSize: "14px" }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: "10px", 
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px"
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link to="/login" style={{ color: "#2196F3", textDecoration: "none" }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;