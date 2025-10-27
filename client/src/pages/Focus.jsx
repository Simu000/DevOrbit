import { useState, useEffect } from "react";

const Focus = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            if (!isBreak) {
              // Work session ended, start break
              setSessions(sessions + 1);
              alert("Work session complete! Time for a break.");
              setIsBreak(true);
              setMinutes(5);
              setSeconds(0);
            } else {
              // Break ended, start work
              alert("Break over! Ready for another work session?");
              setIsBreak(false);
              setMinutes(25);
              setSeconds(0);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, sessions]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (isBreak) {
      setMinutes(5);
    } else {
      setMinutes(25);
    }
    setSeconds(0);
  };

  const switchMode = () => {
    setIsActive(false);
    setIsBreak(!isBreak);
    if (!isBreak) {
      setMinutes(5);
    } else {
      setMinutes(25);
    }
    setSeconds(0);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", maxWidth: "500px", margin: "50px auto" }}>
      <h1>Focus Timer (Pomodoro)</h1>
      
      <div style={{ 
        backgroundColor: isBreak ? "#4CAF50" : "#2196F3", 
        color: "white", 
        padding: "20px", 
        borderRadius: "10px",
        marginTop: "20px"
      }}>
        <h2>{isBreak ? "Break Time" : "Work Time"}</h2>
        <div style={{ fontSize: "72px", fontWeight: "bold", margin: "20px 0" }}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <p>Sessions completed: {sessions}</p>
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        {!isActive ? (
          <button 
            onClick={startTimer}
            style={{ 
              padding: "15px 30px", 
              fontSize: "18px", 
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Start
          </button>
        ) : (
          <button 
            onClick={pauseTimer}
            style={{ 
              padding: "15px 30px", 
              fontSize: "18px", 
              cursor: "pointer",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Pause
          </button>
        )}

        <button 
          onClick={resetTimer}
          style={{ 
            padding: "15px 30px", 
            fontSize: "18px", 
            cursor: "pointer",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Reset
        </button>

        <button 
          onClick={switchMode}
          style={{ 
            padding: "15px 30px", 
            fontSize: "18px", 
            cursor: "pointer",
            backgroundColor: "#9C27B0",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Switch to {isBreak ? "Work" : "Break"}
        </button>
      </div>

      <div style={{ 
        marginTop: "40px", 
        padding: "20px", 
        backgroundColor: "#f9f9f9", 
        borderRadius: "10px",
        textAlign: "left"
      }}>
        <h3>How to use:</h3>
        <ul style={{ lineHeight: "1.8" }}>
          <li>🎯 Work sessions are 25 minutes</li>
          <li>☕ Break sessions are 5 minutes</li>
          <li>▶️ Click Start to begin</li>
          <li>⏸️ Click Pause to pause the timer</li>
          <li>🔄 Click Reset to restart the current session</li>
          <li>🔀 Click Switch to toggle between work and break modes</li>
        </ul>
      </div>
    </div>
  );
};

export default Focus;