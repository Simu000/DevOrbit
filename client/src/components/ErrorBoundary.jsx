import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px 20px",
          textAlign: "center",
          backgroundColor: "var(--card-bg)",
          borderRadius: "10px",
          border: "2px solid #f44336",
          maxWidth: "600px",
          margin: "40px auto"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ color: "var(--text-primary)", marginBottom: "15px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            We're sorry, but something went wrong. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              textAlign: "left", 
              marginTop: "20px",
              color: "var(--text-secondary)",
              fontSize: "12px"
            }}>
              <summary>Error Details (Development)</summary>
              <pre style={{ 
                whiteSpace: "pre-wrap",
                backgroundColor: "var(--bg-secondary)",
                padding: "15px",
                borderRadius: "5px",
                overflow: "auto"
              }}>
                {this.state.error && this.state.error.toString()}
                {"\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "20px"
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;