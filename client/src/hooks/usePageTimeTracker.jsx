import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const usePageTimeTracker = () => {
  const userId = localStorage.getItem("userId") || null;
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const prevPathRef = useRef(location.pathname);

  // Ensure sessionId exists
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  const sendTrackingData = async (path, timeSpent, reason = "unknown", isSiteExit = false) => {
    const currentUserId = localStorage.getItem("userId") || null;
    try {
      await fetch(`${BACKEND_URL}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUserId,
          sessionId,
          path,
          timeSpent,
          exitReason: reason,
          isSiteExit,
          isAnonymous: !userId,
        }),
        keepalive: true,
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  useEffect(() => {
    const detectExitReason = () => {
      const navEntry = performance.getEntriesByType("navigation")[0];
      if (navEntry?.type === "reload") return "page_refresh";
      if (document.visibilityState === "hidden") return "tab_closed";
      return "unknown";
    };

    const handleBeforeUnload = () => {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
      const reason = detectExitReason();
      const isSiteExit = reason !== "internal_navigation";
      sendTrackingData(location.pathname, timeSpent, reason, isSiteExit);
    };

    // Detect external link clicks
    const handleClick = (e) => {
      const link = e.target.closest("a");
      if (link && link.href && !link.href.includes(window.location.host)) {
        const now = Date.now();
        const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
        sendTrackingData(location.pathname, timeSpent, "external_link", true);
      }
    };

    // Detect route change inside SPA
    if (prevPathRef.current !== location.pathname) {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
      sendTrackingData(prevPathRef.current, timeSpent, "internal_navigation", false);
      startTimeRef.current = now;
      prevPathRef.current = location.pathname;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick);
    };
  }, [location.pathname]);
};

export default usePageTimeTracker;
