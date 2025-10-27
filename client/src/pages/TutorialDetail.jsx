import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const TutorialDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/tutorials/${id}`);
        setTutorial(res.data);
      } catch (err) {
        setError("Failed to fetch tutorial");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this tutorial?")) return;

    try {
      await axios.delete(`http://localhost:3000/tutorials/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate("/"); // go back to tutorial list after deletion
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete tutorial");
    }
  };

  if (loading) return <p>Loading tutorial...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!tutorial) return <p>Tutorial not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{tutorial.title}</h1>
      <p><strong>Description:</strong> {tutorial.description}</p>
      <p><strong>Author:</strong> {tutorial.author.username}</p>
      <p>
        <strong>Video:</strong>{" "}
        <a href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer">
          Watch Video
        </a>
      </p>

      {user && user.id === tutorial.authorId && (
        <div style={{ marginTop: "10px" }}>
          <Link to={`/tutorial/edit/${tutorial.id}`} style={{ marginRight: "10px" }}>
            Edit
          </Link>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <Link to="/">Back to Tutorials</Link>
      </div>
    </div>
  );
};

export default TutorialDetail;
