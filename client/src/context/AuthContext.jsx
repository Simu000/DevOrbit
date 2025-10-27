import { createContext, useState, useEffect } from "react";
import { api } from "../services/api.js"; // Import the api instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Token is automatically added by interceptor now
      api.get("/api/auth/me")
        .then((res) => setUser(res.data.user))
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
    const res = await api.post("/api/auth/register", { username, email, password });
    return res.data;
  };

  // Login function - FIXED
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const token = res.data.token;
      
      if (token) {
        localStorage.setItem("token", token);
        setUser(res.data.user);
        return res.data;
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
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
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};