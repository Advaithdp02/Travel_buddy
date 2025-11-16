import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

const usePageTimeTracker = () => {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const prevPathRef = useRef(location.pathname);
  const idleTimerRef = useRef(null);

  // Ensure sessionId exists
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  const getUserId = () => localStorage.getItem("userId") || null;

  // ⭐ Add geolocation reader
  const getUserCoords = () => {
    const coords = localStorage.getItem("userCoords");
    if (!coords) return null;

    try {
      const { latitude, longitude } = JSON.parse(coords);
      if (!latitude || !longitude) return null;

      return {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON format
      };
    } catch (err) {
      return null;
    }
  };

  const sendTrackingData = async (path, timeSpent, reason = "unknown", isSiteExit = false) => {
    try {
      await fetch(`${BACKEND_URL}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: getUserId(),
          sessionId,
          path,
          timeSpent,
          exitReason: reason,
          isSiteExit,
          isAnonymous: !getUserId(),
          geoLocation: getUserCoords(), // ⭐ NEW
        }),
        keepalive: true,
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  // Exit reason detection
  const detectExitReason = (eventType = "unknown") => {
    if (eventType === "beforeunload") return "tab_closed_or_reload";
    return "unknown";
  };

  // Send + reset timer
  const handleSendAndReset = (path, reason, isSiteExit) => {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);

    sendTrackingData(path, timeSpent, reason, isSiteExit);
    startTimeRef.current = now;
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleSendAndReset(location.pathname, "idle_timeout", true);
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    // SPA navigation tracking
    if (prevPathRef.current !== location.pathname) {
      handleSendAndReset(prevPathRef.current, "internal_navigation", false);
      prevPathRef.current = location.pathname;
    }

    resetIdleTimer();

    const handleActivity = () => resetIdleTimer();

    const handleBeforeUnload = () => {
      handleSendAndReset(location.pathname, detectExitReason("beforeunload"), true);
    };

    const handleClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && !link.href.includes(window.location.host)) {
        handleSendAndReset(location.pathname, "external_link", true);
      }
      handleActivity();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("scroll", handleActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [location.pathname]);
};

export default usePageTimeTracker;
