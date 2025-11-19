import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [32, 32],
});

export default function GeoAnalyticsMap() {
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/track/geo-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setGeoData(res.data.data);
      } catch (err) {
        console.error("Geo error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeo();
  }, []);

  if (loading) return <p>Loading map...</p>;

  return (
    <MapContainer
      center={[12.9716, 77.5946]} // Default: Bangalore
      zoom={7}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    >
      {/* OpenStreetMap tiles */}
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Markers */}
      {geoData.map((v, i) => {
        if (!v.geoLocation || !v.geoLocation.coordinates) return null;

        let [lng0, lat0] = v.geoLocation.coordinates;

        // ⭐ OFFSET TO PREVENT OVERLAP (IMPORTANT)
        const offset = 0.0005; // small value = 50 meters approx
        const lat = lat0 + (Math.random() - 0.5) * offset;
        const lng = lng0 + (Math.random() - 0.5) * offset;

        return (
          <Marker key={i} position={[lat, lng]} icon={userIcon}>
            <Popup>
              <div>
                <strong>User:</strong> {v.username || "Anonymous"} <br />
                <strong>Location:</strong> {v.location} <br />
                <strong>District:</strong> {v.district} <br />
                <strong>Time Spent:</strong> {v.timeSpent}s <br />
                <strong>Date:</strong>{" "}
                {new Date(v.visitedAt).toLocaleDateString("en-GB")}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
