// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    if (!allowedRoles.includes(userRole)) {
      // Logged in but role not allowed
      return <Navigate to="/login" replace />;
    }

    // Authorized
    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
