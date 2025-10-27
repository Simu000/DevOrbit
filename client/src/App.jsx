import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ChatProvider } from './context/ChatContext.jsx';
import PrivateRoute from "./components/PrivateRoute.jsx";
import Navbar from "./components/NavBar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import Footer from "./components/Footer.jsx";

// Lazy-loaded components
const TutorialList = lazy(() => import("./pages/TutorialList.jsx"));
const CreateTutorial = lazy(() => import("./pages/CreateTutorial.jsx"));
const UpdateTutorial = lazy(() => import("./pages/UpdateTutorial.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Journal = lazy(() => import("./pages/Journal.jsx"));
const Focus = lazy(() => import("./pages/Focus.jsx"));
const Support = lazy(() => import("./pages/Support.jsx"));
const Content = lazy(() => import("./pages/Content.jsx"));
const MoodAnalytics = lazy(() => import("./pages/MoodAnalytics.jsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const UserSearch = lazy(() => import("./components/UserSearch.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const Chat = lazy(() => import("./pages/Chat.jsx"));

function App() {
  return (
    <ErrorBoundary>
      <ChatProvider>
            <div style={{ 
              minHeight: "100vh", 
              display: "flex", 
              flexDirection: "column",
              backgroundColor: "var(--bg-primary)"
            }}>
              <Navbar />
              
              <main style={{ flex: 1 }}>
                <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } />
                    <Route path="/tutorials" element={
                      <PrivateRoute>
                        <TutorialList />
                      </PrivateRoute>
                    } />
                    <Route path="/tutorials/create" element={
                      <PrivateRoute>
                        <CreateTutorial />
                      </PrivateRoute>
                    } />
                    <Route path="/tutorials/edit/:id" element={
                      <PrivateRoute>
                        <UpdateTutorial />
                      </PrivateRoute>
                    } />
                    <Route path="/leaderboard" element={
                      <PrivateRoute>
                        <Leaderboard />
                      </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } />
                    <Route path="/focus" element={
                      <PrivateRoute>
                        <Focus />
                      </PrivateRoute>
                    } />
                    <Route path="/support" element={
                      <PrivateRoute>
                        <Support />
                      </PrivateRoute>
                    } />
                    <Route path="/content" element={
                      <PrivateRoute>
                        <Content />
                      </PrivateRoute>
                    } />
                    <Route path="/journal" element={
                      <PrivateRoute>
                        <Journal />
                      </PrivateRoute>
                    } />
                    <Route path="/mood-analytics" element={
                      <PrivateRoute>
                        <MoodAnalytics />
                      </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    } />
                    <Route path="/admin" element={
                      <PrivateRoute>
                        <AdminDashboard />
                      </PrivateRoute>
                    } />
                    <Route path="/users" element={
                      <PrivateRoute>
                        <UserSearch />
                      </PrivateRoute>
                    } />
                    <Route path="/user/:id" element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    } />
                    <Route path="/chat" element={
                      <PrivateRoute>
                        <Chat />
                      </PrivateRoute>
                    } />

                    {/* 404 Route */}
                    <Route path="*" element={
                      <div style={{ 
                        padding: "40px 20px", 
                        textAlign: "center",
                        color: "var(--text-primary)"
                      }}>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you're looking for doesn't exist.</p>
                        <button 
                          onClick={() => window.history.back()}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "20px"
                          }}
                        >
                          Go Back
                        </button>
                      </div>
                    } />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
              <ToastContainer />
            </div>
          </ChatProvider>
    </ErrorBoundary>
  );
}

export default App;