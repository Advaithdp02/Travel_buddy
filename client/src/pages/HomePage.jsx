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
   Custom Hook: useGeolocation
----------------------------------------------------------- */
function useGeolocation({
  enableFallback = true,
  ipFallbackUrl = "https://ipapi.co/json/",
  refreshInterval = 2 * 60 * 1000,
  run = true, // **NEW** — geolocation only runs after clicking Allow
} = {}) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const fallbackToIP = useCallback(async () => {
    try {
      setStatus("fallback");
      const res = await fetch(ipFallbackUrl);
      if (!res.ok) throw new Error("IP fallback request failed");

      const data = await res.json();
      const lat = data.latitude ?? data.lat;
      const lon = data.longitude ?? data.lon;

      if (lat && lon) {
        const parsed = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        setCoords(parsed);
        localStorage.setItem("userCoords", JSON.stringify(parsed));
        setStatus("success");
      } else {
        throw new Error("IP fallback returned no coordinates");
      }
    } catch (e) {
      setError(e);
      setStatus("error");
    }
  }, [ipFallbackUrl]);

  const requestGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError(new Error("Browser does not support location"));
      if (enableFallback) fallbackToIP();
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const parsed = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(parsed);
        localStorage.setItem("userCoords", JSON.stringify(parsed));
        setStatus("success");
      },
      (err) => {
        setError(err);
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        if (enableFallback) fallbackToIP();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [enableFallback, fallbackToIP]);

  useEffect(() => {
    if (!run) return; // **IMPORTANT** — do NOT request until user clicks Allow

    requestGeolocation();
    const interval = setInterval(requestGeolocation, refreshInterval);
    return () => clearInterval(interval);
  }, [run, requestGeolocation, refreshInterval]);

  return { coords, status, error };
}

/* -----------------------------------------------------------
   HomePage Component
----------------------------------------------------------- */
export const HomePage = () => {
  const [showLocationPopup, setShowLocationPopup] = useState(true);
  const [locationAllowed, setLocationAllowed] = useState(false);

  const { coords } = useGeolocation({
    enableFallback: true,
    run: locationAllowed, // **RUN ONLY AFTER USER CLICKS ALLOW**
  });

  const [nearestLocation, setNearestLocation] = useState(null);

  useEffect(() => {
    const fetchNearest = async () => {
      if (!coords) return;
      try {
        const res = await fetch(
          `${BACKEND_URL}/locations/nearest/${coords.latitude}/${coords.longitude}`
        );
        if (!res.ok) throw new Error("Failed to fetch nearest location");

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

      {/* ---------- POPUP FIRST ---------- */}
      <LocationRequestModal
        open={showLocationPopup}
        onAllow={() => {
          setLocationAllowed(true);    // now geolocation starts
          setShowLocationPopup(false); // hide popup
        }}
        onClose={() => setShowLocationPopup(false)}
      />

      {/* ---------- MAIN SECTIONS ---------- */}
      <Home nearestLocation={nearestLocation} />
      <AboutUs />
      <Service />
      <TopDestinations userCoords={coords} />
      <BlogSection />
    </div>
  );
};
