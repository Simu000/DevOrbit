// pages/Login.jsx
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const { email, password } = formData;
      await login(email, password);
      setFormData({ email: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error formats
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "400px", 
      margin: "0 auto",
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: "var(--bg-primary, white)",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid var(--border-color, #e0e0e0)"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "30px",
          color: "var(--text-primary, #333)",
          fontSize: "28px",
          fontWeight: "600"
        }}>
          Welcome Back
        </h1>

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
              color: "var(--text-primary, #333)",
              fontSize: "14px"
            }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              style={{ 
                width: "100%",
                padding: "12px 15px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color, #e0e0e0)",
                backgroundColor: "var(--input-bg, white)",
                color: "var(--text-primary, #333)",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500",
              color: "var(--text-primary, #333)",
              fontSize: "14px"
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
              style={{ 
                width: "100%",
                padding: "12px 15px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color, #e0e0e0)",
                backgroundColor: "var(--input-bg, white)",
                color: "var(--text-primary, #333)",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "5px" }}>
            <Link 
              to="/forgot-password" 
              style={{ 
                color: "#2196F3", 
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Forgot your password?
            </Link>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div style={{ 
          marginTop: "30px", 
          textAlign: "center",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-color, #e0e0e0)"
        }}>
          <p style={{ 
            margin: 0,
            color: "var(--text-secondary, #666)",
            fontSize: "14px"
          }}>
            Don't have an account?{" "}
            <Link 
              to="/register" 
              style={{ 
                color: "#2196F3", 
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;