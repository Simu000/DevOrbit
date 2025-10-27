import { useToast } from "../hooks/useToast.js";

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getToastStyle = (type) => {
    const styles = {
      success: { backgroundColor: "#4CAF50", color: "white" },
      error: { backgroundColor: "#f44336", color: "white" },
      warning: { backgroundColor: "#FF9800", color: "white" },
      info: { backgroundColor: "#2196F3", color: "white" }
    };
    return styles[type] || styles.info;
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      maxWidth: "400px"
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: "15px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out",
            ...getToastStyle(toast.type),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px"
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ×
          </button>
        </div>
      ))}
      
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ToastContainer;