import { useState } from "react";
import useJournalStore from "../store/journalStore";

const JournalForm = () => {
  const { addEntry } = useJournalStore();
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      text,
      mood,
      date: new Date().toLocaleString(),
    };
    addEntry(newEntry);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <label>Mood: </label>
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option>😊</option>
        <option>😔</option>
        <option>😡</option>
        <option>😴</option>
      </select>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts..."
        required
        style={{ display: "block", width: "100%", marginTop: "10px" }}
      ></textarea>

      <button type="submit" style={{ marginTop: "10px" }}>
        Add Entry
      </button>
    </form>
  );
};

export default JournalForm;
