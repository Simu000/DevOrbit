import { useState, useEffect } from "react";
import useJournalStore from "../store/journalStore.js";

const moods = [
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Angry", emoji: "😡" },
  { label: "Calm", emoji: "😌" },
  { label: "Excited", emoji: "🤩" },
];

const Journal = () => {
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [editId, setEditId] = useState(null);

  const { entries, loading, error, fetchEntries, addEntry, updateEntry, deleteEntry, clearError } = useJournalStore();

  // Defensive: make sure entries is always an array
  const safeEntries = Array.isArray(entries) ? entries : [];

  useEffect(() => {
    fetchEntries();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || !selectedMood) {
      alert("Please write something and select a mood.");
      return;
    }

    try {
      const entryData = { text: text.trim(), mood: selectedMood };
      
      if (editId) {
        await updateEntry(editId, entryData);
        alert("✅ Entry updated successfully!");
        setEditId(null);
      } else {
        await addEntry(entryData);
        alert("✅ Entry saved successfully!");
      }
      
      // Clear form
      setText("");
      setSelectedMood("");
    } catch (err) {
      console.error("Error saving entry:", err);
      alert("❌ Failed to save entry. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteEntry(id);
        alert("✅ Entry deleted successfully!");
      } catch (err) {
        console.error("Error deleting entry:", err);
        alert("❌ Failed to delete entry. Please try again.");
      }
    }
  };

  const handleEdit = (entry) => {
    setText(entry.text);
    setSelectedMood(entry.mood);
    setEditId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setText("");
    setSelectedMood("");
    setEditId(null);
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "900px", 
      margin: "0 auto",
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh"
    }}>
      <h1 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>
        📔 My Journal
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
        Track your thoughts and feelings
      </p>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: "#f44336",
          color: "white",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: "30px",
        backgroundColor: "var(--card-bg)",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid var(--border-color)"
      }}>
        {editId && (
          <div style={{
            backgroundColor: "var(--info-bg)",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#1976d2", fontWeight: "bold" }}>
              ✏️ Editing entry
            </span>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #1976d2",
                color: "#1976d2",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Cancel Edit
            </button>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts..."
          rows={6}
          disabled={loading}
          style={{ 
            width: "100%", 
            marginBottom: "15px",
            padding: "12px",
            borderRadius: "5px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            fontSize: "14px",
            resize: "vertical"
          }}
        />

        <div style={{ marginBottom: "15px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            fontWeight: "bold",
            color: "var(--text-primary)"
          }}>
            How are you feeling?
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {moods.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelectedMood(m.label)}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: selectedMood === m.label ? "#4CAF50" : "var(--input-bg)",
                  color: selectedMood === m.label ? "white" : "var(--text-primary)",
                  border: `2px solid ${selectedMood === m.label ? "#4CAF50" : "var(--border-color)"}`,
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: selectedMood === m.label ? "bold" : "normal",
                  transition: "all 0.2s"
                }}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: "12px 24px", 
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%"
          }}
        >
          {loading ? "Saving..." : editId ? "💾 Update Entry" : "💾 Save Entry"}
        </button>
      </form>

      {/* Entries List */}
      <div>
        <h2 style={{ 
          color: "var(--text-primary)", 
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          📚 Previous Entries
          <span style={{ 
            fontSize: "14px", 
            color: "var(--text-secondary)",
            fontWeight: "normal"
          }}>
            ({safeEntries.length})
          </span>
        </h2>

        {loading && safeEntries.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px",
            color: "var(--text-secondary)"
          }}>
            Loading entries...
          </div>
        ) : safeEntries.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "var(--card-bg)",
            borderRadius: "10px",
            border: "2px dashed var(--border-color)"
          }}>
            <p style={{ fontSize: "48px", marginBottom: "15px" }}>📝</p>
            <p style={{ 
              fontSize: "18px", 
              color: "var(--text-primary)",
              marginBottom: "5px"
            }}>
              No entries yet
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              Start journaling to track your thoughts and feelings
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {safeEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: "20px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  backgroundColor: "var(--card-bg)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "start",
                  marginBottom: "12px"
                }}>
                  <div>
                    <span style={{ 
                      fontSize: "24px",
                      marginRight: "8px"
                    }}>
                      {moods.find(m => m.label === entry.mood)?.emoji || "😊"}
                    </span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {entry.mood}
                    </strong>
                  </div>
                  <small style={{ color: "var(--text-secondary)" }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </small>
                </div>

                <p style={{ 
                  color: "var(--text-primary)",
                  lineHeight: "1.6",
                  marginBottom: "15px",
                  whiteSpace: "pre-wrap"
                }}>
                  {entry.text}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleEdit(entry)}
                    disabled={loading}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "5px",
                      border: "1px solid #2196F3",
                      backgroundColor: "transparent",
                      color: "#2196F3",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={loading}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "5px",
                      border: "1px solid #f44336",
                      backgroundColor: "transparent",
                      color: "#f44336",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;