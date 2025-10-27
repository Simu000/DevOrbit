import { useEffect } from "react";
import useReputation from "../hooks/useReputation";
import ReputationBadge from "../components/ReputationBadge";

const Leaderboard = () => {
  const { leaderboard, loading, fetchLeaderboard } = useReputation();

  useEffect(() => {
    fetchLeaderboard(50); // Top 50 users
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading leaderboard...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>🏆 Leaderboard</h1>
      <p style={{ color: "var(--text-secondary, #666)", marginBottom: "30px" }}>
        Top contributors on DevOrbit
      </p>

      <div style={{ backgroundColor: "var(--card-bg, #fff)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--header-bg, #f0f0f0)", borderBottom: "2px solid var(--border-color, #ccc)" }}>
              <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Rank</th>
              <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>User</th>
              <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Level</th>
              <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Reputation</th>
              <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Tutorials</th>
              <th style={{ padding: "15px", textAlign: "center", fontWeight: "bold" }}>Ratings Given</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr 
                key={user.id} 
                style={{ 
                  borderBottom: "1px solid var(--border-color, #eee)",
                  backgroundColor: index < 3 ? "rgba(255, 215, 0, 0.1)" : "transparent"
                }}
              >
                <td style={{ padding: "15px" }}>
                  <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </span>
                </td>
                <td style={{ padding: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {user.avatar && (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                      />
                    )}
                    <strong>{user.username}</strong>
                  </div>
                </td>
                <td style={{ padding: "15px" }}>
                  <ReputationBadge user={user} showPoints={false} size="small" />
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#4CAF50" }}>
                    {user.reputation}
                  </span>
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  {user._count?.tutorials || 0}
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  {user._count?.ratings || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ 
        marginTop: "30px", 
        padding: "20px", 
        backgroundColor: "var(--info-bg, #e3f2fd)",
        borderRadius: "10px",
        borderLeft: "4px solid #2196F3"
      }}>
        <h3 style={{ marginTop: 0 }}>How to Earn Reputation Points</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li>📝 Create a tutorial: <strong>+20 points</strong></li>
          <li>⭐ Rate a tutorial: <strong>+3 points</strong></li>
          <li>🌟 Receive a 4-5 star rating: <strong>+10 points</strong></li>
          <li>💫 Receive a 1-3 star rating: <strong>+5 points</strong></li>
          <li>🎯 Tutorial reaches 100 views: <strong>+50 points</strong> (+ badge)</li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;