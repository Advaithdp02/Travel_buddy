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

  // -------------------------------
  // ⭐ Ensure sessionId exists
  // -------------------------------
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  const getUserId = () => localStorage.getItem("userId") || null;

  // -------------------------------
  // ⭐ ACCURATE GPS LOCKING (NEW)
  // -------------------------------
  const getAccurateLocation = () => {
    return new Promise((resolve) => {
      let watchId = null;
      let locked = false;

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          

          // Only lock when accuracy is GOOD
          if (!locked && accuracy < 50) {
            locked = true;

            const coords = { latitude, longitude };

            // Save once — never overwrite with bad readings
            localStorage.setItem("userCoords", JSON.stringify(coords));

            navigator.geolocation.clearWatch(watchId);
            resolve(coords);
          }
        },
        (err) => {
          console.warn("GPS error:", err);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // -------------------------------
  // ⭐ GeoJSON formatting
  // -------------------------------
  const getUserCoords = () => {
    const coords = localStorage.getItem("userCoords");
    if (!coords) return null;

    try {
      const { latitude, longitude } = JSON.parse(coords);
      if (!latitude || !longitude) return null;

      return {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON
      };
    } catch {
      return null;
    }
  };

  // -------------------------------
  // ⭐ Tracking Sender
  // -------------------------------
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
          geoLocation: getUserCoords(),
        }),
        keepalive: true,
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  // -------------------------------
  // ⭐ Exit Reason
  // -------------------------------
  const detectExitReason = (eventType = "unknown") => {
    if (eventType === "beforeunload") return "tab_closed_or_reload";
    return "unknown";
  };


  // -------------------------------
  // ⭐ Send + Reset Timer
  // -------------------------------
  const handleSendAndReset = (path, reason, isSiteExit) => {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);

    sendTrackingData(path, timeSpent, reason, isSiteExit);
    startTimeRef.current = now;
  };

  // -------------------------------
  // ⭐ Idle Timer Reset
  // -------------------------------
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleSendAndReset(location.pathname, "idle_timeout", true);
    }, IDLE_TIMEOUT);
  };

  // -------------------------------
  // ⭐ Main Effect
  // -------------------------------
  useEffect(() => {
    // Lock accurate GPS once per session
    getAccurateLocation();

    // SPA page navigation tracking
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
  // -------------------------------