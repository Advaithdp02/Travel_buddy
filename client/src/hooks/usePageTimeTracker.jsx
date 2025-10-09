import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const usePageTimeTracker = () => {
  const userId = localStorage.getItem("userId") || null;
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const prevPathRef = useRef(location.pathname);

  // Ensure sessionId exists (for anonymous users)
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("sessionId", sessionId);
  }

  const sendTrackingData = async (path, timeSpent) => {
    try {
      await fetch(`${BACKEND_URL}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user: userId,
          sessionId,
          path,          // just send the raw path
          timeSpent,
          isAnonymous: !userId
        }),
        keepalive: true // allows sending even when page unloads
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  useEffect(() => {
    const handlePageLeave = () => {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTimeRef.current) / 1000);
      sendTrackingData(location.pathname, timeSpent);
    };

    // When route changes inside the SPA
    if (prevPathRef.current !== location.pathname) {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTimeRef.current) / 1000);
      sendTrackingData(prevPathRef.current, timeSpent);
      startTimeRef.current = now;
      prevPathRef.current = location.pathname;
    }

    window.addEventListener("beforeunload", handlePageLeave);

    return () => {
      window.removeEventListener("beforeunload", handlePageLeave);
      handlePageLeave(); // send final data on unmount
    };
  }, [location.pathname]);
};

export default usePageTimeTracker;
