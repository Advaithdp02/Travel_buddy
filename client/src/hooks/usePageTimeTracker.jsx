import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { initGA, trackGAView } from "../ga";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

const usePageTimeTracker = () => {
  const location = useLocation();

  const startTimeRef = useRef(Date.now());
  const prevPathRef = useRef(location.pathname);
  const idleTimerRef = useRef(null);
  const unloadSentRef = useRef(false);
  const firstLoadRef = useRef(true);

  // ---------------------------------------------------------
  // FIXED resolveLocation (NO mongoose, NO DB models in frontend)
  // ---------------------------------------------------------
  const resolveLocation = async (url) => {
    if (!url) {
      return {
        locationName: "Unknown Location",
        districtName: "N/A",
      };
    }

    const clean = url.replace(/^\/+/, "");
    if (clean === "") {
      return {
        locationName: "Home",
        districtName: "N/A",
      };
    }

    const segments = clean.split("/");
    const base = segments[0];
    const lastSegment = segments[segments.length - 1];

    const NON_LOCATION_PAGES = [
      "admin",
      "login",
      "register",
      "account",
      "settings",
      "about",
      "contact",
      "help",
    ];

    // ⭐ Profile special rule
    if (base === "profile") {
      const username = segments[1];
      return {
        locationName: username ? `Profile: ${username}` : "Profile",
        districtName: "N/A",
      };
    }

    // Normal static pages
    if (NON_LOCATION_PAGES.includes(base)) {
      return {
        locationName: base.charAt(0).toUpperCase() + base.slice(1),
        districtName: "N/A",
      };
    }

    // ⭐ Check if ID looks like MongoDB ObjectId (NO mongoose needed)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(lastSegment);

    if (!isObjectId) {
      return {
        locationName: segments[1] || segments[0] || "Unknown Location",
        districtName: "N/A",
      };
    }

    // ⭐ Call backend to resolve location + district
    try {
      const res = await fetch(`${BACKEND_URL}/resolve-location/${lastSegment}`);
      const data = await res.json();

      return {
        locationName: data.locationName || segments[0],
        districtName: data.districtName || "N/A"
      };
    } catch (err) {
      console.log("resolveLocation error:", err);
      return {
        locationName: segments[1] || segments[0] || "Unknown Location",
        districtName: "N/A",
      };
    }
  };

  // -----------------------------
  // CREATE SESSION ID
  // -----------------------------
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  const getUserId = () => localStorage.getItem("userId") || null;

  // -----------------------------
  // GEOLOCATION
  // -----------------------------
  const getUserCoords = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("userCoords"));
      if (!stored) return null;
      return {
        type: "Point",
        coordinates: [stored.longitude, stored.latitude]
      };
    } catch {
      return null;
    }
  };

  // --------------------------------------------------------
  // sendTrackingData
  // --------------------------------------------------------
  const sendTrackingData = async ({
    actionType,
    fromUrl,
    toUrl = null,
    exitReason,
    isSiteExit = false
  }) => {

    const now = Date.now();
    const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
    startTimeRef.current = now;

    const resolved = await resolveLocation(fromUrl);

    // Prevent duplicate exit logging
    if (isSiteExit && window.__EXIT_SENT__) return;
    if (isSiteExit) window.__EXIT_SENT__ = true;

    const payload = {
      user: getUserId(),
      sessionId,
      actionType,
      fromUrl,
      toUrl,
      exitReason,
      isSiteExit,
      timeSpent,
      isAnonymous: !getUserId(),
      geoLocation: getUserCoords(),
      location: resolved.locationName,
      district: resolved.districtName
    };

    try {
      await fetch(`${BACKEND_URL}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Track failed:", err);
    }
  };

  // -----------------------------
  // IDLE TIMER
  // -----------------------------
  const startIdleTimer = () => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      sendTrackingData({
        actionType: "idle_timeout_exit",
        fromUrl: location.pathname,
        exitReason: "User inactive for 15 minutes",
        isSiteExit: true
      });
    }, IDLE_TIMEOUT);
  };

  // -----------------------------
  // MAIN EFFECT
  // -----------------------------
  useEffect(() => {
    if (firstLoadRef.current) {
      initGA();
      trackGAView(location.pathname);
      firstLoadRef.current = false;
    } else {
      sendTrackingData({
        actionType: "internal_navigation",
        fromUrl: prevPathRef.current,
        toUrl: location.pathname,
        exitReason: "User navigated inside site",
        isSiteExit: false
      });

      trackGAView(location.pathname);
    }

    prevPathRef.current = location.pathname;
    startIdleTimer();

    // External link detection
    const detectExternal = (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      if (!link.href.includes(window.location.host)) {
        sendTrackingData({
          actionType: "external_exit",
          fromUrl: location.pathname,
          toUrl: link.href,
          exitReason: "Clicked external link",
          isSiteExit: true
        });
      }
    };

    // Tab hidden
    const onHide = () => {
      if (document.visibilityState !== "hidden") return;
      if (unloadSentRef.current) return;
      unloadSentRef.current = true;

      sendTrackingData({
        actionType: "tab_hidden_exit",
        fromUrl: location.pathname,
        exitReason: "Tab hidden or switched",
        isSiteExit: true
      });
    };

    // Tab close / reload
    const onUnload = () => {
      if (unloadSentRef.current) return;
      unloadSentRef.current = true;

      sendTrackingData({
        actionType: "tab_close_exit",
        fromUrl: location.pathname,
        exitReason: "Tab closed or reloaded",
        isSiteExit: true
      });
    };

    document.addEventListener("click", detectExternal);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      document.removeEventListener("click", detectExternal);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
      clearTimeout(idleTimerRef.current);
    };
  }, [location.pathname]);
};

export default usePageTimeTracker;
