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
  const idleTriggeredRef = useRef(false);
  const unloadSentRef = useRef(false);
  const firstLoadRef = useRef(true);

  // -----------------------------------
  // ⭐ Ensure sessionId (1 per device)
  // -----------------------------------
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  const getUserId = () => localStorage.getItem("userId") || null;
  const CACHE_TTL = 20 * 60 * 1000; // 20 minutes

const cleanOldCache = () => {
  const now = Date.now();

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("nearest_location_") || key.startsWith("nearest_district_")) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (!item?.expiry || now > item.expiry) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  });
};


  // -----------------------------------------------------
  // ⭐ GET GPS (first reading only — NO ACCURACY CHECK)
  // -----------------------------------------------------
  const getAccurateLocation = () => {
    return new Promise((resolve) => {
      let watchId = null;

      const failTimeout = setTimeout(() => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        resolve(null);
      }, 8000); // prevent leaking forever

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          const coords = { latitude, longitude };
          localStorage.setItem("userCoords", JSON.stringify(coords));

          clearTimeout(failTimeout);
          navigator.geolocation.clearWatch(watchId);

          resolve(coords);
        },
        () => {
          clearTimeout(failTimeout);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const getUserCoords = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("userCoords"));
      if (!stored) return null;

      return {
        type: "Point",
        coordinates: [stored.longitude, stored.latitude],
      };
    } catch {
      return null;
    }
  };

  // -----------------------------------------------------
  // ⭐ SEND TRACK DATA
  // -----------------------------------------------------
  const sendTrackingData = async (
    path,
    timeSpent,
    reason = "unknown",
    isSiteExit = false
  ) => {
    try {
      await fetch(`${BACKEND_URL}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
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
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  // -----------------------------------------------------
  // ⭐ EXIT REASON
  // -----------------------------------------------------
  const getExitReason = (eventType = "unknown") => {
    if (eventType === "beforeunload") return "tab_closed_or_reload";
    return "unknown";
  };

  // -----------------------------------------------------
  // ⭐ Safe Send + Reset Timer
  // -----------------------------------------------------
  const handleSendAndReset = (path, reason, isSiteExit = false) => {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);

    sendTrackingData(path, timeSpent, reason, isSiteExit);

    startTimeRef.current = now;
  };

  // -----------------------------------------------------
  // ⭐ Idle tracking
  // -----------------------------------------------------
  const resetIdleTimer = () => {
    if (idleTriggeredRef.current) return; // block after timeout

    clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      idleTriggeredRef.current = true;
      handleSendAndReset(location.pathname, "idle_timeout", true);
    }, IDLE_TIMEOUT);
  };

  // -----------------------------------------------------
  // ⭐ Main Effect
  // -----------------------------------------------------
  useEffect(() => {
    getAccurateLocation(); // run once per mount

    // --- Detect internal navigation ---
    // ⭐ Prevent tracking on first load
    if (!firstLoadRef.current && prevPathRef.current !== location.pathname) {
      handleSendAndReset(prevPathRef.current, "internal_navigation", false);
    }

    // After first render, disable first load flag
    firstLoadRef.current = false;

    // Always update the previous path
    prevPathRef.current = location.pathname;

    resetIdleTimer();

    const handleActivity = () => {
      if (!idleTriggeredRef.current) resetIdleTimer();
    };

    const handleExternalClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && !link.href.includes(window.location.host)) {
        handleSendAndReset(location.pathname, "external_link", true);
      }
      handleActivity();
    };

    // --- Tab close / reload ---
    const handleBeforeUnload = () => {
      if (unloadSentRef.current) return;
      unloadSentRef.current = true;

      clearTimeout(idleTimerRef.current);

      handleSendAndReset(
        location.pathname,
        getExitReason("beforeunload"),
        true
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleExternalClick);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    return () => {
      

      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleExternalClick);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("scroll", handleActivity);

      clearTimeout(idleTimerRef.current);
    };
  }, [location.pathname]);
   useEffect(() => {
    cleanOldCache();
  }, []);
};

export default usePageTimeTracker;
