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

  /* ---------------------------------------------------------
     Get / persist sessionId
  --------------------------------------------------------- */
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  /* ---------------------------------------------------------
     Get userId 
  --------------------------------------------------------- */
  const getUserId = () => localStorage.getItem("userId") || null;

  /* ---------------------------------------------------------
     Get user coordinates from localStorage → userCoords
  --------------------------------------------------------- */
  const getGeoLocation = () => {
    try {
      const coords = JSON.parse(localStorage.getItem("userCoords"));
      if (coords && coords.latitude && coords.longitude) {
        return {
          type: "Point",
          coordinates: [coords.longitude, coords.latitude], // GeoJSON format
        };
      }
    } catch {}
    return null;
  };

  /* ---------------------------------------------------------
     Send tracking data to backend
  --------------------------------------------------------- */
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
          geoLocation: getGeoLocation(), // ⭐ Include geolocation here
        }),
        keepalive: true,
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  /* ---------------------------------------------------------
     Detect exit reason
  --------------------------------------------------------- */
  const detectExitReason = (eventType = "unknown") => {
    if (eventType === "beforeunload") return "tab_closed_or_reload";
    return "unknown";
  };

  /* ---------------------------------------------------------
     Send + reset timers
  --------------------------------------------------------- */
  const handleSendAndReset = (path, reason, isSiteExit) => {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
    sendTrackingData(path, timeSpent, reason, isSiteExit);
    startTimeRef.current = now;
  };

  /* ---------------------------------------------------------
     Idle timer logic
  --------------------------------------------------------- */
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      handleSendAndReset(location.pathname, "idle_timeout", true);
    }, IDLE_TIMEOUT);
  };

  /* ---------------------------------------------------------
     Main effect
  --------------------------------------------------------- */
  useEffect(() => {
    // Route changed → store previous page visit
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
