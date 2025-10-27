import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ 
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh"
    }}>
      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "56px", 
            margin: "0 0 20px 0",
            fontWeight: "bold"
          }}>
            🚀 Welcome to DevOrbit
          </h1>
          <p style={{ 
            fontSize: "24px", 
            margin: "0 0 40px 0",
            opacity: 0.95
          }}>
            A secure, developer-focused collaboration platform where you share tutorials, 
            communicate safely, and build your reputation.
          </p>
          
          {user ? (
            <Link
              to="/dashboard"
              style={{
                display: "inline-block",
                padding: "16px 40px",
                backgroundColor: "white",
                color: "#667eea",
                textDecoration: "none",
                borderRadius: "30px",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Go to Dashboard →
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/register"
                style={{
                  display: "inline-block",
                  padding: "16px 40px",
                  backgroundColor: "white",
                  color: "#667eea",
                  textDecoration: "none",
                  borderRadius: "30px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                style={{
                  display: "inline-block",
                  padding: "16px 40px",
                  backgroundColor: "transparent",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "30px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  border: "2px solid white",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#667eea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "white";
                }}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: "80px 20px",
        backgroundColor: "var(--bg-secondary)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "42px", 
            textAlign: "center",
            marginBottom: "60px",
            color: "var(--text-primary)"
          }}>
            ✨ Why Choose DevOrbit?
          </h2>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px" 
          }}>
            {/* Feature 1 */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📚</div>
              <h3 style={{ 
                color: "var(--text-primary)", 
                marginBottom: "15px",
                fontSize: "24px"
              }}>
                Tutorial Hub
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Share and discover high-quality video tutorials. Rate, comment, and learn from the community.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏆</div>
              <h3 style={{ 
                color: "var(--text-primary)", 
                marginBottom: "15px",
                fontSize: "24px"
              }}>
                Reputation System
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Earn points for contributing. Level up from Beginner to Master and unlock new privileges.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛡️</div>
              <h3 style={{ 
                color: "var(--text-primary)", 
                marginBottom: "15px",
                fontSize: "24px"
              }}>
                Community Moderation
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Report inappropriate content. Auto-hide system keeps the community safe and high-quality.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌓</div>
              <h3 style={{ 
                color: "var(--text-primary)", 
                marginBottom: "15px",
                fontSize: "24px"
              }}>
                Dark Mode
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Beautiful UI with dark and light themes. Easy on the eyes, perfect for coding sessions.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📊</div>
              <h3 style={{ 
                color: "var(--text-primary)", 
                marginBottom: "15px",
                fontSize: "24px"
              }}>
                Analytics Dashboard
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Track your progress with detailed analytics. See your contributions and growth over time.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎯</div>
              <h3 style={{ 
                color: "var(--text-primary)", 
                marginBottom: "15px",
                fontSize: "24px"
              }}>
                Gamification
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Earn badges and achievements. Compete on the leaderboard and showcase your expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "42px", 
            textAlign: "center",
            marginBottom: "60px",
            color: "var(--text-primary)"
          }}>
            🎓 How It Works
          </h2>

          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "40px"
          }}>
            {/* Step 1 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap"
            }}>
              <div style={{
                minWidth: "80px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "bold"
              }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  fontSize: "24px"
                }}>
                  Sign Up & Create Profile
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6" }}>
                  Create your free account and set up your developer profile. Start as a Beginner and work your way up!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap"
            }}>
              <div style={{
                minWidth: "80px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#2196F3",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "bold"
              }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  fontSize: "24px"
                }}>
                  Share Your Knowledge
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6" }}>
                  Create and upload tutorials. Share what you know with the community and help others learn.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap"
            }}>
              <div style={{
                minWidth: "80px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#FF9800",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "bold"
              }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  fontSize: "24px"
                }}>
                  Earn Reputation & Level Up
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6" }}>
                  Get points for contributions, helpful content, and community engagement. Unlock new levels and badges!
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap"
            }}>
              <div style={{
                minWidth: "80px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#9C27B0",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "bold"
              }}>
                4
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  fontSize: "24px"
                }}>
                  Build Your Network
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6" }}>
                  Connect with other developers, rate tutorials, and engage with the community. Grow together!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          padding: "80px 20px",
          textAlign: "center"
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ 
              fontSize: "42px", 
              margin: "0 0 20px 0"
            }}>
              Ready to Join DevOrbit?
            </h2>
            <p style={{ 
              fontSize: "20px", 
              margin: "0 0 40px 0",
              opacity: 0.95
            }}>
              Join thousands of developers sharing knowledge and building their reputation.
            </p>
            <Link
              to="/register"
              style={{
                display: "inline-block",
                padding: "18px 50px",
                backgroundColor: "white",
                color: "#f5576c",
                textDecoration: "none",
                borderRadius: "30px",
                fontSize: "20px",
                fontWeight: "bold",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Create Free Account →
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: "var(--nav-bg)",
        padding: "40px 20px",
        textAlign: "center",
        borderTop: "1px solid var(--border-color)"
      }}>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          © 2025 DevOrbit. Built with ❤️ for developers.
        </p>
      </footer>
    </div>
  );
};

export default Home;