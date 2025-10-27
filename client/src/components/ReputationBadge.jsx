import useReputation from "../hooks/useReputation";

const ReputationBadge = ({ user, showPoints = true, size = "medium" }) => {
  const { getLevelColor, getLevelIcon } = useReputation();

  const sizes = {
    small: { fontSize: "12px", padding: "4px 8px" },
    medium: { fontSize: "14px", padding: "6px 12px" },
    large: { fontSize: "16px", padding: "8px 16px" },
  };

  const level = user?.level || "Beginner";
  const reputation = user?.reputation || 0;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: getLevelColor(level),
        color: "white",
        borderRadius: "20px",
        fontWeight: "bold",
        ...sizes[size],
      }}
    >
      <span>{getLevelIcon(level)}</span>
      <span>{level}</span>
      {showPoints && <span>({reputation})</span>}
    </div>
  );
};

export default ReputationBadge;