import useJournalStore from "../store/journalStore";

const JournalEntryCard = ({ entry }) => {
  const { deleteEntry } = useJournalStore();

  return (
    <div
      style={{
        border: "1px solid #ccc",
        margin: "10px 0",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <h3>{entry.mood} - {entry.date}</h3>
      <p>{entry.text}</p>
      <button onClick={() => deleteEntry(entry.id)}>Delete</button>
    </div>
  );
};

export default JournalEntryCard;
