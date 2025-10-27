// src/components/FileUpload.jsx
import { useState, useRef } from "react";
import axios from "axios";

const FileUpload = ({ onUploadSuccess, onUploadError, accept = "video/*", maxSize = 50 * 1024 * 1024 }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a valid video file (MP4, WebM, or OGG)');
    }

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    return true;
  };

  const handleFile = async (file) => {
    try {
      validateFile(file);
      
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("video", file);

      const token = localStorage.getItem("token");
      
      const response = await axios.post("http://localhost:3000/api/upload/video", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      onUploadSuccess?.(response.data);
      setProgress(100);
      
      // Reset after success
      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(error.response?.data?.message || error.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: "100%" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept={accept}
        style={{ display: "none" }}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          border: `2px dashed ${dragActive ? "#4CAF50" : "#cccccc"}`,
          borderRadius: "10px",
          padding: "40px 20px",
          textAlign: "center",
          backgroundColor: dragActive ? "#f0f8f0" : "var(--card-bg)",
          cursor: uploading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>📤</div>
            <h3>Uploading Video...</h3>
            
            {/* Progress Bar */}
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
              margin: "20px 0",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#4CAF50",
                transition: "width 0.3s ease",
                borderRadius: "4px"
              }} />
            </div>
            
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              {progress}% Complete
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎬</div>
            <h3>Upload Video Tutorial</h3>
            <p style={{ color: "var(--text-secondary)", margin: "10px 0" }}>
              Drag and drop your video file here, or click to browse
            </p>
            <div style={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              display: "inline-block",
              marginTop: "10px"
            }}>
              MP4, WebM, OGG • Max 50MB
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      {!uploading && (
        <div style={{
          marginTop: "15px",
          padding: "15px",
          backgroundColor: "var(--info-bg)",
          borderRadius: "8px",
          borderLeft: "4px solid #2196F3"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#1976d2" }}>📝 Upload Guidelines</h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: "20px", 
            color: "var(--text-secondary)",
            fontSize: "14px",
            lineHeight: "1.6"
          }}>
            <li>Supported formats: MP4, WebM, OGG</li>
            <li>Maximum file size: 50MB</li>
            <li>Recommended resolution: 720p or higher</li>
            <li>Keep videos under 10 minutes for best experience</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;