import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReputationBadge from "./ReputationBadge.jsx";

const UserSearch = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users.slice(0, 10)); // Show first 10 users by default
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>👥 Find Users</h2>
      
      {/* Search Input */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px",
            borderRadius: "25px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            fontSize: "16px"
          }}
        />
      </div>

      {/* Users List */}
      <div style={{ display: "grid", gap: "15px" }}>
        {filteredUsers.map(user => (
          <div
            key={user.id}
            style={{
              padding: "15px",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              backgroundColor: "var(--card-bg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold"
              }}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>{user.username}</h4>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
                  {user.email}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <ReputationBadge user={user} size="small" />
              <Link
                to={`/user/${user.id}`}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "5px",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && searchTerm && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          <p>No users found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;