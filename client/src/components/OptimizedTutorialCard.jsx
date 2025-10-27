import { memo, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars.jsx";
import RatingModal from "./RatingModal.jsx";
import ReportModal from "./ReportModal.jsx";
import ReputationBadge from "./ReputationBadge.jsx";
import useTutorials from "../hooks/useTutorials.jsx";

const OptimizedTutorialCard = memo(({ tutorial, currentUser, onUpdate }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { rateTutorial, reportTutorial } = useTutorials();

  // Memoized computed values
  const isAuthor = useMemo(() => 
    currentUser && currentUser.id === tutorial.authorId, 
    [currentUser, tutorial.authorId]
  );

  const canInteract = useMemo(() => 
    !isAuthor && currentUser, 
    [isAuthor, currentUser]
  );

  // Memoized handlers
  const handleRate = useCallback(async (rating, comment) => {
    try {
      await rateTutorial(tutorial.id, rating, comment);
      onUpdate?.();
    } catch (error) {
      console.error("Rating failed:", error);
    }
  }, [tutorial.id, rateTutorial, onUpdate]);

  const handleReport = useCallback(async (reason, details) => {
    try {
      await reportTutorial(tutorial.id, reason, details);
      onUpdate?.();
    } catch (error) {
      console.error("Report failed:", error);
    }
  }, [tutorial.id, reportTutorial, onUpdate]);

  // Memoized modal handlers
  const modalHandlers = useMemo(() => ({
    openRatingModal: () => setShowRatingModal(true),
    closeRatingModal: () => setShowRatingModal(false),
    openReportModal: () => setShowReportModal(true),
    closeReportModal: () => setShowReportModal(false),
  }), []);

  // Memoized video URL - handle both external and uploaded videos
  const videoUrl = useMemo(() => {
    return tutorial.videoType === 'uploaded' && tutorial.uploadedVideo 
      ? tutorial.uploadedVideo 
      : tutorial.videoUrl;
  }, [tutorial.videoType, tutorial.uploadedVideo, tutorial.videoUrl]);

  // Memoized card styles
  const cardStyles = useMemo(() => ({
    border: "1px solid var(--border-color, #ccc)",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "var(--card-bg, #fff)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease-in-out",
  }), []);

  const handleMouseEnter = useCallback((e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  }, []);

  console.log(`🔁 TutorialCard rendered: ${tutorial.title}`);

  return (
    <>
      <div
        style={cardStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: "0 0 10px 0", 
              fontSize: "18px",
              lineHeight: "1.3",
              color: "var(--text-primary)"
            }}>
              {tutorial.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                by <strong>{tutorial.author?.username || "Unknown"}</strong>
              </span>
              {tutorial.author && <ReputationBadge user={tutorial.author} size="small" />}
            </div>
          </div>
          
          {tutorial.category && tutorial.category !== "General" && (
            <span
              style={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
                whiteSpace: "nowrap"
              }}
            >
              {tutorial.category}
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ 
          color: "var(--text-secondary, #666)", 
          marginBottom: "15px",
          lineHeight: "1.5",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {tutorial.description}
        </p>

        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
            {tutorial.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "500"
                }}
              >
                #{tag}
              </span>
            ))}
            {tutorial.tags.length > 3 && (
              <span style={{ 
                color: "var(--text-secondary)", 
                fontSize: "11px",
                alignSelf: "center"
              }}>
                +{tutorial.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats & Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "15px" }}>
          <RatingStars 
            rating={tutorial.averageRating || 0} 
            readonly 
            size="small" 
          />
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              👁️ {tutorial.views || 0}
            </span>
            {tutorial.videoDuration && (
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                ⏱️ {Math.round(tutorial.videoDuration / 60)}min
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={videoUrl}
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
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
          >
            {tutorial.videoType === 'uploaded' ? '🎬 Watch' : '📺 Watch'} Tutorial →
          </a>

          {canInteract && (
            <>
              <button
                onClick={modalHandlers.openRatingModal}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1976d2"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2196F3"}
              >
                ⭐ Rate
              </button>
              
              <button
                onClick={modalHandlers.openReportModal}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f57c00"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ff9800"}
              >
                🚩 Report
              </button>
            </>
          )}

          {isAuthor && (
            <Link
              to={`/tutorials/edit/${tutorial.id}`}
              style={{
                padding: "8px 16px",
                backgroundColor: "#9C27B0",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                fontSize: "14px",
                fontWeight: "bold",
                transition: "background-color 0.2s",
                display: "inline-block"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7b1fa2"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#9C27B0"}
            >
              ✏️ Edit
            </Link>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRatingModal && (
        <RatingModal
          tutorial={tutorial}
          onClose={modalHandlers.closeRatingModal}
          onSubmit={handleRate}
        />
      )}

      {showReportModal && (
        <ReportModal
          tutorial={tutorial}
          onClose={modalHandlers.closeReportModal}
          onSubmit={handleReport}
        />
      )}
    </>
  );
});

OptimizedTutorialCard.displayName = "OptimizedTutorialCard";

export default OptimizedTutorialCard;