import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { username, email, password } = formData;
      await register(username, email, password);
      setFormData({ username: "", email: "", password: "" });
      navigate("/login");
    } catch (err) {
      console.log("Register Error:", err.response?.data);
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(", "));
      } else {
        setError(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h1>Register</h1>
      {error && <p style={{ color: "red", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "5px" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          name="username" 
          placeholder="Username" 
          value={formData.username} 
          onChange={handleChange}
          required
          style={{ padding: "10px", fontSize: "14px" }}
        />
        <input 
          name="email" 
          type="email"
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange}
          required
          style={{ padding: "10px", fontSize: "14px" }}
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password (min 6 chars, 1 number, 1 symbol)" 
          value={formData.password} 
          onChange={handleChange}
          required
          style={{ padding: "10px", fontSize: "14px" }}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            padding: "10px", 
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px"
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;