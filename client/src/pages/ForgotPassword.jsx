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
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "400px", 
      margin: "50px auto",
      backgroundColor: "var(--bg-secondary)",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Reset Your Password</h1>
      <p style={{ 
        color: "var(--text-secondary)", 
        marginBottom: "30px",
        textAlign: "center" 
      }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
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
          disabled={loading}
          style={{ 
            padding: "12px", 
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: loading ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "background-color 0.3s"
          }}
        >
          {loading ? "Sending Reset Link..." : "Send Reset Link"}
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

export default ForgotPassword;