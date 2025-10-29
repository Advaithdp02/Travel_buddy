import { useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function useExitTracking(sessionId, userId, location, district) {
  useEffect(() => {
    let startTime = Date.now();

    const sendExitReason = (reason, isSiteExit = false, destination = null) => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      axios.post(`${BACKEND_URL}/track/exit`, {
        sessionId,
        userId,
        location,
        district,
        timeSpent,
        exitReason: destination ? `${reason}_${destination}` : reason,
        isSiteExit,
      }).catch(err => console.error("Exit tracking error:", err));
    };

    // ✅ Detect tab close or browser close
    const handleBeforeUnload = () => {
      sendExitReason("closed_tab", true);
    };

    // ✅ Detect external link clicks (e.g., google.com)
    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (link && !link.href.includes(window.location.origin)) {
        try {
          const domain = new URL(link.href).hostname.replace("www.", "");
          sendExitReason("navigated_to_external", true, domain);
        } catch {
          sendExitReason("navigated_to_external", true);
        }
      }
    };

    // ✅ Detect navigation within your site (if using React Router)
    const handlePopState = () => {
      sendExitReason("navigated_within_site", false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleLinkClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sessionId, userId, location, district]);
}
