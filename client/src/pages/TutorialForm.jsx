import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const TutorialForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // tutorial ID for edit, undefined for create

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If editing, fetch tutorial data
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/tutorials/${id}`)
        .then((res) => setFormData({
          title: res.data.title,
          description: res.data.description,
          videoUrl: res.data.videoUrl,
        }))
        .catch((err) => setError("Failed to load tutorial"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return setError("You must be logged in");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      if (id) {
        // Update existing tutorial
        await axios.put(
          `http://localhost:3000/tutorials/${id}`,
          formData,
          config
        );
      } else {
        // Create new tutorial
        await axios.post("http://localhost:3000/tutorials", formData, config);
      }

      navigate("/"); // redirect to tutorial list after success
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>{id ? "Edit Tutorial" : "Create Tutorial"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <input
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="Video URL"
          required
        />
        <button type="submit">{id ? "Update" : "Create"}</button>
      </form>
    </div>
  );
};

export default TutorialForm;
