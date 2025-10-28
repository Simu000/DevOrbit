// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/api/auth/me")
        .then((res) => {
          if (res.data && res.data.user) {
            setUser(res.data.user);
          }
        })
        .catch((error) => {
          console.error("Auto-login failed:", error);
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (username, email, password) => {
    try {
      const res = await api.post("/api/auth/register", { 
        username, 
        email, 
        password 
      });
      return res.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { 
        email, 
        password 
      });
      
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user || res.data);
        return res.data;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};