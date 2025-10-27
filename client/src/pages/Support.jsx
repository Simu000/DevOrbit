import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const Support = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/support");
      // Normalize posts: ensure comments is always an array and author exists
      const normalized = Array.isArray(res.data)
        ? res.data.map((p) => ({
            ...p,
            comments: Array.isArray(p.comments) ? p.comments : [],
            author: p.author || { username: 'Unknown' },
          }))
        : [];
      setPosts(normalized);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/support",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([res.data, ...posts]);
      setFormData({ title: "", content: "" });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentContent.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:3000/api/support/${postId}/comments`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update posts with new comment
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, comments: [...p.comments, res.data] }
          : p
      ));

      setCommentContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/support/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter(p => p.id !== postId));
      setSelectedPost(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Peer Support Forum</h1>
      <p>Share your experiences and support each other</p>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {showForm ? "Cancel" : "Create New Post"}
      </button>

      {showForm && (
        <form onSubmit={handleCreatePost} style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
          <input
            type="text"
            placeholder="Post Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <textarea
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={5}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Post
          </button>
        </form>
      )}

      <div style={{ marginTop: "30px" }}>
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px", borderRadius: "5px", backgroundColor: "#fff" }}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small style={{ color: "#666" }}>
                Posted by <strong>{post.author.username}</strong> on {new Date(post.createdAt).toLocaleString()}
              </small>

              {user && post.authorId === user.id && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  style={{
                    marginLeft: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}

              <button
                onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                {selectedPost === post.id
                  ? "Hide Comments"
                  : `Show Comments (${Array.isArray(post.comments) ? post.comments.length : 0})`}
              </button>

              {selectedPost === post.id && (
                <div style={{ marginTop: "15px", paddingLeft: "20px", borderLeft: "3px solid #4CAF50" }}>
                  <h4>Comments:</h4>
                  {(!Array.isArray(post.comments) || post.comments.length === 0) ? (
                    <p style={{ color: "#666" }}>No comments yet.</p>
                  ) : (
                    post.comments.map((comment) => (
                      <div key={comment.id} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
                        <p>{comment.content}</p>
                        <small style={{ color: "#666" }}>
                          by <strong>{comment.author?.username ?? 'Unknown'}</strong> on {new Date(comment.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}

                  <div style={{ marginTop: "15px" }}>
                    <textarea
                      placeholder="Add a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={3}
                      style={{ width: "100%", padding: "8px" }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      style={{
                        marginTop: "10px",
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Support;