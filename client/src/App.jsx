import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

const App = () => {
  return (
    <Router>
      {/* ✅ Move inside Router so it has access to `useLocation()` */}
      <TrackingWrapper />
      <ScrollToTop />
      <Header />

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

      <Footer />
    </Router>
  );
};

// 👇 A simple wrapper component that runs the tracking hook
function TrackingWrapper() {
  useUserTracking();
  return null; // no UI
}

export default App;
