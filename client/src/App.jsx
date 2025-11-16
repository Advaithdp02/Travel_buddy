import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { DestinationPageFull } from "./pages/DestinationPageFull";
import Login from "./components/Login";
import { Registration } from "./components/Registration";
import { Profile } from "./components/Profile";
import { ProfilePublic } from "./components/ProfilePublic";
import { AdminPage } from "./components/Admin/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { NotFoundPage } from "./components/ErrorPage";
import { BlogPage } from "./components/BlogPage";
import ContactUs from "./components/ContactUs";
import { DistrictPage } from "./components/DistrictPage";

import useUserTracking from "./hooks/usePageTimeTracker";
import ScrollToTop from "./components/ScrollToTop";
import ForgotPassword from "./components/ForgotPassword";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  return (
    <Router>
      <GlobalAuthCheck />
      <ScrollToTop />

      {/* Proper Layout */}
      <Header />

      <MainRoutes />

      <Footer />

      {/* Tracking must be LAST so Router context is ready */}
      <TrackingWrapper />
    </Router>
  );
}


function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/destination/:id" element={<DestinationPageFull />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:username" element={<ProfilePublic />} />
      <Route path="/blogs/:slug" element={<BlogPage />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/district/:id" element={<DistrictPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/* ----------------------------------------------------
   GLOBAL AUTH CHECK
---------------------------------------------------- */
function GlobalAuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      logoutUser();
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users/verify`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) logoutUser();
      } catch {
        logoutUser();
      }
    };

    verify();
  }, []);

  const logoutUser = () => {
    localStorage.clear();
    navigate("/login");
  };

  return null;
}

/* ----------------------------------------------------
   PAGE TRACKING WRAPPER — MUST BE LAST!
---------------------------------------------------- */
function TrackingWrapper() {
  useUserTracking(); // NOW SAFE
  return null;
}
