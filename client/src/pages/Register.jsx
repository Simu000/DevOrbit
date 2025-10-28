// pages/Register.jsx
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { username, email, password } = formData;
      await register(username, email, password);
      setFormData({ username: "", email: "", password: "" });
      
      // Show success message and redirect to login
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle different error formats
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "400px", 
      margin: "50px auto",
      backgroundColor: "var(--bg-primary)",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Register</h1>
      
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          padding: "12px 15px", 
          backgroundColor: "#ffebee", 
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ffcdd2",
          fontSize: "14px"
        }}>
          ❌ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500",
            color: "var(--text-primary)",
            fontSize: "14px"
          }}>
            Username
          </label>
          <input 
            name="username" 
            placeholder="Enter your username" 
            value={formData.username} 
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: "100%",
              padding: "12px 15px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500",
            color: "var(--text-primary)",
            fontSize: "14px"
          }}>
            Email Address
          </label>
          <input 
            name="email" 
            type="email"
            placeholder="Enter your email" 
            value={formData.email} 
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: "100%",
              padding: "12px 15px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500",
            color: "var(--text-primary)",
            fontSize: "14px"
          }}>
            Password
          </label>
          <input 
            name="password" 
            type="password" 
            placeholder="Enter your password (min 6 characters)" 
            value={formData.password} 
            onChange={handleChange}
            required
            disabled={loading}
            minLength={6}
            style={{ 
              width: "100%",
              padding: "12px 15px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            padding: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            transition: "background-color 0.2s",
            marginTop: "10px"
          }}
        >
          {loading ? "Registering..." : "Create Account"}
        </button>
      </form>
      
      <div style={{ 
        marginTop: "30px", 
        textAlign: "center",
        paddingTop: "20px",
        borderTop: "1px solid var(--border-color)"
      }}>
        <p style={{ 
          margin: 0,
          color: "var(--text-secondary)",
          fontSize: "14px"
        }}>
          Already have an account?{" "}
          <Link 
            to="/login" 
            style={{ 
              color: "#2196F3", 
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;