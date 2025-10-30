import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const TutorialForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });
  
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState("");

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/tutorials/${id}`)
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

  const handleFileChange = (e) => {
    console.log("=== FILE CHANGE EVENT ===");
    const file = e.target.files?.[0];
    console.log("Selected file:", file);
    
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      const error = `Invalid file type: ${file.type}. Please select a video file (MP4, WebM, OGG, MOV).`;
      console.error(error);
      setError(error);
      setVideoFile(null);
      setFileInfo("");
      return;
    }
    
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      const error = "Video file must be smaller than 50MB";
      console.error(error);
      setError(error);
      setVideoFile(null);
      setFileInfo("");
      return;
    }
    
    // File is valid
    setVideoFile(file);
    setFileInfo(`✓ Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    setError("");
    console.log("✓ File validated and set successfully");
  };

  const uploadVideo = async (file) => {
    console.log("=== STARTING VIDEO UPLOAD ===");
    console.log("File to upload:", file.name, file.size, "bytes");
    
    const uploadFormData = new FormData();
    uploadFormData.append('video', file);
    
    console.log("FormData created, sending to server...");
    
    try {
      const token = localStorage.getItem("token");
      console.log("Token found:", !!token);
      
      const response = await axios.post(
        'http://localhost:3000/api/upload/video', 
        uploadFormData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );
      
      console.log("✓ Upload successful:", response.data);
      return response.data.videoUrl;
    } catch (error) {
      console.error("✗ Upload failed:", error);
      console.error("Error response:", error.response?.data);
      throw new Error(error.response?.data?.message || "Failed to upload video");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FORM SUBMIT ===");
    setError("");
    
    if (!user) {
      setError("You must be logged in");
      return;
    }

    // Check if either file or URL is provided
    if (!videoFile && !formData.videoUrl) {
      setError("Please either upload a video file or provide a video URL");
      return;
    }

    console.log("Validation passed. Processing submission...");
    console.log("Video file:", videoFile?.name || "None");
    console.log("Video URL:", formData.videoUrl || "None");

    try {
      setIsUploading(true);
      let finalVideoUrl = formData.videoUrl;

      // If a file is selected, upload it first
      if (videoFile) {
        console.log("Uploading video file...");
        finalVideoUrl = await uploadVideo(videoFile);
        console.log("Video uploaded, URL:", finalVideoUrl);
      }

      // Prepare tutorial data
      const tutorialData = {
        title: formData.title,
        description: formData.description,
        videoUrl: finalVideoUrl,
      };

      console.log("Submitting tutorial data:", tutorialData);

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      if (id) {
        // Update existing tutorial
        await axios.put(
          `http://localhost:3000/api/tutorials/${id}`,
          tutorialData,
          config
        );
        console.log("✓ Tutorial updated successfully");
      } else {
        // Create new tutorial
        await axios.post("http://localhost:3000/api/tutorials", tutorialData, config);
        console.log("✓ Tutorial created successfully");
      }

      navigate("/");
    } catch (err) {
      console.error("✗ Submission error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px",
      backgroundColor: "#f5f5f5",
      borderRadius: "10px"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        {id ? "Edit Tutorial" : "Create New Tutorial"}
      </h2>
      
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          backgroundColor: "#ffebee", 
          padding: "15px", 
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #d32f2f",
          fontWeight: "500"
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Tutorial Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter tutorial title"
            required
            disabled={isUploading}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your tutorial..."
            required
            disabled={isUploading}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px",
              resize: "vertical"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Upload Video File
          </label>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileChange}
            disabled={isUploading}
            style={{ display: "none" }}
          />
          
          {/* Custom upload button */}
          <div
            onClick={() => {
              if (!isUploading) {
                console.log("Upload area clicked");
                fileInputRef.current?.click();
              }
            }}
            style={{
              width: "100%",
              padding: "30px",
              border: "3px dashed #2196F3",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
              cursor: isUploading ? "not-allowed" : "pointer",
              textAlign: "center",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = "#e3f2fd";
                e.currentTarget.style.borderColor = "#1976d2";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fafafa";
              e.currentTarget.style.borderColor = "#2196F3";
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎬</div>
            <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "5px", color: "#333" }}>
              Click to select video file
            </div>
            <div style={{ fontSize: "13px", color: "#666" }}>
              MP4, WebM, OGG, MOV (Max 50MB)
            </div>
          </div>
          
          {fileInfo && (
            <div style={{ 
              marginTop: "10px", 
              padding: "12px", 
              backgroundColor: "#e8f5e9", 
              borderRadius: "5px",
              border: "1px solid #4caf50",
              color: "#2e7d32",
              fontWeight: "500"
            }}>
              {fileInfo}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Or Video URL (YouTube, Vimeo, etc.)
          </label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://youtube.com/your-video"
            disabled={isUploading}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          />
        </div>

        {isUploading && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ 
              width: "100%", 
              backgroundColor: "#f0f0f0", 
              borderRadius: "10px",
              overflow: "hidden",
              height: "30px"
            }}>
              <div 
                style={{ 
                  width: `${uploadProgress}%`, 
                  height: "100%", 
                  backgroundColor: "#4caf50",
                  transition: "width 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                {uploadProgress}%
              </div>
            </div>
            <p style={{ textAlign: "center", margin: "10px 0", fontWeight: "500" }}>
              Uploading video... {uploadProgress}%
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={isUploading}
            style={{
              padding: "12px 24px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              borderRadius: "5px",
              cursor: isUploading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "500"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || (!videoFile && !formData.videoUrl)}
            style={{
              padding: "12px 24px",
              border: "none",
              backgroundColor: (isUploading || (!videoFile && !formData.videoUrl)) ? "#ccc" : "#2196f3",
              color: "white",
              borderRadius: "5px",
              cursor: (isUploading || (!videoFile && !formData.videoUrl)) ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "15px"
            }}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : (id ? "Update Tutorial" : "Create Tutorial")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorialForm;