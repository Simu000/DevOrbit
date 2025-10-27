import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // wait until auth state is ready

  if (!user) return <Navigate to="/login" />; // redirect if not logged in

  return children; // render the protected component
};

export default PrivateRoute;
