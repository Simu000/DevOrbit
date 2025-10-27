import { useState } from "react";
import RatingStars from "./RatingStars";
import RatingModal from "./RatingModal";
import ReportModal from "./ReportModal";
import ReputationBadge from "./ReputationBadge";
import useTutorials from "../hooks/useTutorials";

const TutorialCard = ({ tutorial, currentUser, onUpdate }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { rateTutorial, reportTutorial } = useTutorials();

  const handleRate = async (rating, comment) => {
    await rateTutorial(tutorial.id, rating, comment);
    if (onUpdate) onUpdate();
  };

  const handleReport = async (reason, details) => {
    await reportTutorial(tutorial.id, reason, details);
    if (onUpdate) onUpdate();
  };

  const isAuthor = currentUser && currentUser.id === tutorial.authorId;

  return (
    <>
      <div
        style={{
          border: "1px solid var(--border-color, #ccc)",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "var(--card-bg, #fff)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 10px 0" }}>{tutorial.title}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>
                by <strong>{tutorial.author?.username || "Unknown"}</strong>
              </span>
              {tutorial.author && <ReputationBadge user={tutorial.author} size="small" />}
            </div>
          </div>
          
          {tutorial.category && (
            <span
              style={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {tutorial.category}
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ color: "var(--text-secondary, #666)", marginBottom: "15px" }}>
          {tutorial.description}
        </p>

        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
            {tutorial.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "3px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#555",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats & Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "15px" }}>
          <RatingStars rating={tutorial.averageRating || 0} readonly size="small" />
          <span style={{ fontSize: "14px", color: "#666" }}>
            👁️ {tutorial.views || 0} views
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={tutorial.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Watch Tutorial →
          </a>

          {!isAuthor && currentUser && (
            <>
              <button
                onClick={() => setShowRatingModal(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ⭐ Rate
              </button>
              
              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                🚩 Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRatingModal && (
        <RatingModal
          tutorial={tutorial}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRate}
        />
      )}

      {showReportModal && (
        <ReportModal
          tutorial={tutorial}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </>
  );
};

export default TutorialCard;