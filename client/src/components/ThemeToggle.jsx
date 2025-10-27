import useTheme from "../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 12px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: isDark ? "#424242" : "#f0f0f0",
        color: isDark ? "#fff" : "#333",
        cursor: "pointer",
        fontSize: "18px",
        transition: "all 0.3s",
      }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;