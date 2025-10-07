import React, { useEffect, useState, useCallback } from "react";
import { Header } from "./Header";
import {
  LocationIcon,
  HotelIcon,
  RestaurantIcon,
  LeftArrowIcon,
  RightArrowIcon,
  ClimateIcon,
  PlacesIcon,
  TrafficIcon,
} from "./Icons";
import { data, Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
function useGeolocation({ enableFallback = true, ipFallbackUrl = "https://ipapi.co/json/" } = {}) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);


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
        setCoords({ latitude, longitude });
        localStorage.setItem("userCoords", JSON.stringify({ latitude, longitude }));
        setStatus("success");
      },
      (err) => {
        setError(err);
        if (err.code === err.PERMISSION_DENIED) setStatus("denied");
        else setStatus("error");
        if (enableFallback) fallbackToIP();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [enableFallback]);

  const fallbackToIP = useCallback(async () => {
    try {
      setStatus("fallback");
      const res = await fetch(ipFallbackUrl);
      if (!res.ok) throw new Error("IP fallback request failed");
      const data = await res.json();
      const lat = data.latitude ?? data.lat;
      const lon = data.longitude ?? data.lon;
      if (lat != null && lon != null) {
        setCoords({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
        localStorage.setItem("userCoords", JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lon) }));
        setStatus("success");
      } else throw new Error("IP fallback returned no coordinates");
    } catch (e) {
      setError(e);
      setStatus((s) => (s === "fallback" ? "error" : s));
    }
  }, [ipFallbackUrl]);

  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  return { coords, status, error, requestGeolocation };
}


export const HomePage = ({ currentPage, navigate }) => {
  const topDestinations = [
    { name: "Kozhikode", img: "https://picsum.photos/300/400?random=1" },
    { name: "Alappuzha", img: "https://picsum.photos/300/400?random=2" },
    { name: "Palakkad", img: "https://picsum.photos/300/400?random=3" },
    { name: "Wayanad", img: "https://picsum.photos/300/400?random=4" },
  ];

  const services = [
    { name: "Climate", icon: <ClimateIcon />, description: "Lorem Ipsum..." },
    { name: "Location", icon: <LocationIcon className="w-8 h-8 text-brand-dark" />, description: "Lorem Ipsum..." },
    { name: "Places", icon: <PlacesIcon />, description: "Lorem Ipsum..." },
    { name: "Hotels", icon: <HotelIcon className="w-8 h-8 text-brand-dark" />, description: "Lorem Ipsum..." },
    { name: "Traffic", icon: <TrafficIcon />, description: "Lorem Ipsum..." },
  ];

  const { coords, status, error, requestGeolocation } = useGeolocation({ enableFallback: true });
  const[nearestLocation,setNearestLocation]=useState(null);
  // ------------------------------
  // useEffect to fetch nearest location
  // ------------------------------
  useEffect(() => {
    const fetchNearest = async () => {
      if (!coords) return;

      try {
        const res = await fetch(
          `${BACKEND_URL}/locations/nearest/${coords.latitude}/${coords.longitude}`
        );
        if (!res.ok) throw new Error("Failed to fetch nearest location");

        const data = await res.json();
        setNearestLocation(data._id); // Assuming data contains the location object with an _id field
        console.log("Nearest Location:", data); // Display result in console
      } catch (err) {
        console.error(err);
      }
    };

    fetchNearest();
  }, [coords]);

  return (
    <>
      <section className="relative bg-white pt-32 pb-16 overflow-hidden">
        <Header currentPage={currentPage} navigate={navigate} />
        <div className="container mx-auto px-8 grid md:grid-cols-2 items-center gap-8">
          <div className="z-10">
            <p className="text-brand-yellow font-semibold text-lg">Explore the world</p>
            <h1 className="text-5xl md:text-7xl font-bold text-brand-dark my-4 leading-tight">It's Time to Travel Around the World</h1>
            <p className="text-brand-gray mb-8">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>

            <div className="flex gap-3">
              <button className="bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105">
               <Link to={`/${nearestLocation}`}  > EXPLORE NOW</Link>
              </button>
              
            </div>
          </div>
          <div className="relative">
            <img src="https://i.imgur.com/kS5B4i2.png" alt="Happy couple ready to travel" className="relative z-10 max-w-full mx-auto" style={{ maxWidth: "550px" }} />
          </div>
        </div>
      </section>

      {/* Top Destinations Section */}
      <section className="bg-brand-light-purple py-20 px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <p className="text-brand-yellow font-semibold text-lg">Top Destination</p>
              <h2 className="text-4xl font-bold text-brand-dark">Explore Top Destinations</h2>
            </div>
            <div className="flex space-x-4">
              <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100">
                <LeftArrowIcon />
              </button>
              <button className="p-3 bg-brand-yellow rounded-full shadow-md hover:bg-yellow-400">
                <RightArrowIcon />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topDestinations.map((dest) => (
              <div key={dest.name} className="bg-white rounded-2xl shadow-lg overflow-hidden p-4">
                <img src={dest.img} alt={dest.name} className="w-full h-64 object-cover rounded-xl mb-4" />
                <h3 className="text-xl font-bold text-brand-dark">{dest.name}</h3>
                <p className="text-brand-gray text-sm mb-4">Enjoy The Beauty Of {dest.name}</p>
                <div className="flex justify-between items-center text-sm text-brand-gray border-t border-b py-2 my-2">
                  <span className="flex items-center"><LocationIcon /> 150+</span>
                  <span className="flex items-center"><HotelIcon /> 150+</span>
                  <span className="flex items-center"><RestaurantIcon /> 150+</span>
                </div>
                <button className="w-full bg-brand-dark text-white font-semibold py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors">LETS GO</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
