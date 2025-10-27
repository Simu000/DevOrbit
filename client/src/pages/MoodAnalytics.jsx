import { useMemo } from "react";
import useJournalStore from "../store/journalStore.js";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

const MoodAnalytics = () => {
  const { entries } = useJournalStore();

  // Convert moods to numeric values for line chart
  const chartData = useMemo(() => {
    return entries.map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(),
      moodValue:
        entry.mood === "Happy"
          ? 5
          : entry.mood === "Excited"
          ? 4
          : entry.mood === "Calm"
          ? 3
          : entry.mood === "Sad"
          ? 2
          : 1,
    }));
  }, [entries]);

  // Count mood occurrences for pie chart
  const moodCounts = useMemo(() => {
    const count = {};
    entries.forEach((entry) => {
      count[entry.mood] = (count[entry.mood] || 0) + 1;
    });
    return Object.keys(count).map((mood) => ({
      name: mood,
      value: count[mood],
    }));
  }, [entries]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mood Analytics Dashboard</h2>

      {entries.length === 0 ? (
        <p>No mood data yet. Add journal entries to see analytics.</p>
      ) : (
        <>
          {/* LINE CHART */}
          <h3>Mood Trend Over Time</h3>
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="moodValue" stroke="#8884d8" />
          </LineChart>

          {/* PIE CHART */}
          <h3>Mood Breakdown</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={moodCounts}
              cx={200}
              cy={150}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              label
            >
              {moodCounts.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </>
      )}
    </div>
  );
};

export default MoodAnalytics;
