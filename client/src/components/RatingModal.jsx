import { useState } from "react";
import RatingStars from "./RatingStars";

const RatingModal = ({ tutorial, onClose, onSubmit, existingRating = null }) => {
  const [rating, setRating] = useState(existingRating?.value || 0);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err) {
      alert("Failed to submit rating");
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
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--card-bg, #0b1220)",
          color: "var(--text-primary, #e5e7eb)",
          padding: "30px",
          borderRadius: "10px",
          maxWidth: "500px",
          width: "90%",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Rate Tutorial</h2>
        <p style={{ color: "var(--text-secondary, #9ca3af)", marginBottom: "20px" }}>
          {tutorial.title}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "var(--text-primary, #e5e7eb)" }}>
              Your Rating:
            </label>
            <RatingStars rating={rating} onRate={setRating} size="large" />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "var(--text-primary, #e5e7eb)" }}>
              Comment (optional):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this tutorial..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "var(--input-bg, #071028)",
                color: "var(--text-primary, #e5e7eb)",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "transparent",
                color: "var(--text-primary, #e5e7eb)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent, #4CAF50)",
                color: "white",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;