const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  const sizes = {
    small: "30px",
    medium: "50px", 
    large: "80px"
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      justifyContent: "center", 
      alignItems: "center", 
      padding: "40px 20px",
      color: "var(--text-primary)"
    }}>
      <div 
        style={{
          width: sizes[size],
          height: sizes[size],
          border: `4px solid var(--border-color)`,
          borderTop: `4px solid var(--accent-color)`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "15px"
        }}
      />
      <p style={{ 
        margin: 0, 
        color: "var(--text-secondary)",
        fontSize: "14px"
      }}>
        {text}
      </p>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;