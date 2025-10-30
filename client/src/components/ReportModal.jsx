import { useState } from "react";

const ReportModal = ({ tutorial, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    "spam",
    "inappropriate",
    "low-quality",
    "copyright",
    "misleading",
    "other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert("Please select a reason");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(reason, details);
      onClose();
    } catch (err) {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(5px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "90%",
          border: "1px solid #333",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          color: "#e0e0e0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ 
            color: "#fff", 
            margin: "0 0 10px 0",
            fontSize: "24px",
            fontWeight: "600"
          }}>
            Report Tutorial
          </h2>
          <p style={{ 
            color: "#b0b0b0", 
            margin: 0,
            fontSize: "14px",
            backgroundColor: "#2a2a2a",
            padding: "10px",
            borderRadius: "6px",
            borderLeft: "3px solid #ff6b6b"
          }}>
            "{tutorial.title}"
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "10px", 
              fontWeight: "600",
              color: "#fff",
              fontSize: "14px"
            }}>
              Reason for reporting:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#2a2a2a",
                color: "#e0e0e0",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "#ff6b6b"}
              onBlur={(e) => e.target.style.borderColor = "#444"}
            >
              <option value="" style={{ color: "#888" }}>Select a reason...</option>
              {reasons.map((r) => (
                <option key={r} value={r} style={{ color: "#e0e0e0", backgroundColor: "#2a2a2a" }}>
                  {r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "10px", 
              fontWeight: "600",
              color: "#fff",
              fontSize: "14px"
            }}>
              Additional details (optional):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more information about why you're reporting this tutorial..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#2a2a2a",
                color: "#e0e0e0",
                fontSize: "14px",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.3s ease",
                fontFamily: "inherit"
              }}
              onFocus={(e) => e.target.style.borderColor = "#ff6b6b"}
              onBlur={(e) => e.target.style.borderColor = "#444"}
            />
          </div>

          <div style={{ 
            display: "flex", 
            gap: "12px", 
            justifyContent: "flex-end",
            borderTop: "1px solid #333",
            paddingTop: "20px"
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid #555",
                backgroundColor: "transparent",
                color: "#b0b0b0",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#333";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#b0b0b0";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: submitting ? "#555" : "#ff6b6b",
                color: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                opacity: submitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = "#ff5252";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.target.style.backgroundColor = "#ff6b6b";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              {submitting ? (
                <>
                  <span style={{ marginRight: "8px" }}>⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span style={{ marginRight: "8px" }}>⚠️</span>
                  Report Tutorial
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;