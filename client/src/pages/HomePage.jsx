import React, { useEffect, useState, useCallback } from "react";
import { Home } from "../components/Home";
import { AboutUs } from "../components/AboutUs";
import { Service } from "../components/Service";
import { TopDestinations } from "../components/TopDestination";
import { BlogSection } from "../components/BlogSection";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ------------------------------
// Custom Hook: useGeolocation
// ------------------------------
function useGeolocation({
  enableFallback = true,
  ipFallbackUrl = "https://ipapi.co/json/",
  refreshInterval = 2 * 60 * 1000 // 2 minutes in ms
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
      if (lat != null && lon != null) {
        const parsed = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        setCoords(parsed);
        localStorage.setItem("userCoords", JSON.stringify(parsed));
        setStatus("success");
      } else throw new Error("IP fallback returned no coordinates");
    } catch (e) {
      setError(e);
      setStatus("error");
    }
  }, [ipFallbackUrl]);

  const requestGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError(new Error("Geolocation is not supported by this browser."));
      if (enableFallback) fallbackToIP();
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const parsed = { latitude, longitude };
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
    requestGeolocation(); // initial request
    const interval = setInterval(requestGeolocation, refreshInterval); // repeat every 2 mins
    return () => clearInterval(interval); // cleanup on unmount
  }, [requestGeolocation, refreshInterval]);

  return { coords, status, error };
}

// ------------------------------
// HomePage Component
// ------------------------------
export const HomePage = () => {
  const { coords } = useGeolocation({ enableFallback: true });
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
        console.log("Nearest Location:", data);
      } catch (err) {
        console.error("Error fetching nearest location:", err);
      }
    };
    fetchNearest();
  }, [coords]);

  return (
    <div className="app-container">
      <Home nearestLocation={nearestLocation} />
      <AboutUs />
      <Service />
      <TopDestinations userCoords={coords} />
      <BlogSection />
    </div>
  );
};
