// =====================
// HomePage.jsx (Mobile FIXED – FINAL)
// =====================
import React, { useEffect, useState, useCallback } from "react";

import { Home } from "../components/Home";
import { AboutUs } from "../components/AboutUs";
import { Service } from "../components/Service";
import { TopDestinations } from "../components/TopDestination";
import { BlogSection } from "../components/BlogSection";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* -----------------------------------------------------------
   Location Request Popup
----------------------------------------------------------- */
const LocationRequestModal = ({ open, onAllow, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-11/12 max-w-sm">
        <h2 className="text-xl font-bold text-gray-800">Enable Location Access</h2>
        <p className="text-gray-600 mt-3">
          To show nearby destinations and personalize results, we need your location.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Not Now
          </button>

          <button
            onClick={onAllow}
            className="px-4 py-2 rounded-lg bg-[#9156F1] text-white hover:bg-[#7b3cdc]"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------------------------------------
   MOBILE-SAFE useGeolocation HOOK
----------------------------------------------------------- */
function useGeolocation({ enableFallback = false } = {}) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Load saved coords first (mobile fix)
  useEffect(() => {
    const saved = localStorage.getItem("userCoords");
    if (saved) {
      setCoords(JSON.parse(saved));
      setStatus("success");
    }
  }, []);

  const getFallbackIP = useCallback(async () => {
    try {
      setStatus("fallback");
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();

      const parsed = {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      };

      setCoords(parsed);
      localStorage.setItem("userCoords", JSON.stringify(parsed));
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e);
    }
  }, []);

  return { coords, status, error };
}

/* -----------------------------------------------------------
   HomePage Component (FINAL + MOBILE FIX)
----------------------------------------------------------- */
export const HomePage = () => {
  const [locationAllowed, setLocationAllowed] = useState(
    localStorage.getItem("locationPermission") === "granted"
  );

  const [showPopup, setShowPopup] = useState(
    localStorage.getItem("locationPermission") !== "granted"
  );

  const { coords } = useGeolocation({
    enableFallback: locationAllowed,
  });

  const [nearestLocation, setNearestLocation] = useState(null);

  // Fetch nearest destination
  useEffect(() => {
    const fetchNearest = async () => {
      if (!coords) return;

      try {
        const res = await fetch(
          `${BACKEND_URL}/locations/nearest/${coords.latitude}/${coords.longitude}`
        );
        const data = await res.json();
        setNearestLocation(data._id);
        localStorage.setItem("nearestLocation", data._id);
      } catch (err) {
        console.error("Error fetching nearest location:", err);
      }
    };

    fetchNearest();
  }, [coords]);

  return (
    <div className="app-container">

      {/* POPUP */}
      <LocationRequestModal
        open={showPopup}
        onAllow={() => {
          // Mark permission
          localStorage.setItem("locationPermission", "granted");
          setLocationAllowed(true);
          setShowPopup(false);

          // 🔥 MOBILE FIX –
          // Request location DIRECTLY inside the user gesture.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const parsed = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                };

                // Save for next reload
                localStorage.setItem("userCoords", JSON.stringify(parsed));

                // Reload to let hooks pick it up
                window.location.reload();
              },
              (err) => {
                console.log("Geo error:", err);
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          }
        }}
        onClose={() => {
          localStorage.setItem("locationPermission", "denied");
          setShowPopup(false);
        }}
      />

      {/* MAIN CONTENT */}
      <Home nearestLocation={nearestLocation} />
      <AboutUs />
      <Service />
      <TopDestinations userCoords={coords} />
      <BlogSection />
    </div>
  );
};
