import { useState } from "react";

const RatingStars = ({ rating = 0, onRate, readonly = false, size = "medium" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    small: "16px",
    medium: "24px",
    large: "32px",
  };

  const handleClick = (value) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          style={{
            fontSize: sizes[size],
            cursor: readonly ? "default" : "pointer",
            color: star <= displayRating ? "#FFD700" : "#CCCCCC",
            transition: "color 0.2s",
          }}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span style={{ marginLeft: "8px", fontSize: "14px", color: "#666" }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;