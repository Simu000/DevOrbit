const Footer = () => {
  return (
    <footer style={{
      backgroundColor: "var(--nav-bg)",
      padding: "30px 20px",
      textAlign: "center",
      borderTop: "1px solid var(--border-color)",
      marginTop: "50px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "30px",
          marginBottom: "20px",
          textAlign: "left"
        }}>
          {/* Brand */}
          <div>
            <h3 style={{ 
              color: "var(--text-primary)",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              🚀 DevOrbit
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
              A secure, developer-focused collaboration platform for sharing knowledge and building reputation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "var(--text-primary)", marginBottom: "15px" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="/tutorials" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Tutorials
              </a>
              <a href="/leaderboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Leaderboard
              </a>
              <a href="/support" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Support Forum
              </a>
              <a href="/content" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Resources
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: "var(--text-primary)", marginBottom: "15px" }}>Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="/help" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Help Center
              </a>
              <a href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Contact Us
              </a>
              <a href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Privacy Policy
              </a>
              <a href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Terms of Service
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 style={{ color: "var(--text-primary)", marginBottom: "15px" }}>Join Our Community</h4>
            <p style={{ color: "var(--text-secondary)", marginBottom: "15px" }}>
              Connect with developers worldwide and grow together.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>💬</span>
              <span style={{ fontSize: "24px" }}>🐙</span>
              <span style={{ fontSize: "24px" }}>🐦</span>
              <span style={{ fontSize: "24px" }}>💼</span>
            </div>
          </div>
        </div>

        <div style={{ 
          borderTop: "1px solid var(--border-color)",
          paddingTop: "20px",
          color: "var(--text-secondary)",
          fontSize: "14px"
        }}>
          <p style={{ margin: 0 }}>
            © 2025 DevOrbit. Built with ❤️ for the developer community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;