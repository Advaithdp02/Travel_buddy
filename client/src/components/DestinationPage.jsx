import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import {
  StarIcon,
  CheckIcon,
  WeatherIcon,
  PhoneIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  LocationPinIcon
} from './Icons';

export const DestinationPage = ({ currentPage, navigate }) => {
  const [activeTab, setActiveTab] = useState("comments");

  // Hero Section
  const [hero, setHero] = useState({
    title: "Neelimala Viewpoint",
    subtitle: "Beauty of Wayanad from Neelimala Viewpoint",
    bgImg: "https://picsum.photos/seed/wayanad/1600/900"
  });

  // About Section
  const [about, setAbout] = useState({
    heading: "About Neelimala Viewpoint",
    subHeading: "A Window to Wayanad's Scenic Splendor",
    description:
      "Neelimala Viewpoint in Wayanad is a stunning destination offering panoramic views of Kerala's lush landscapes. Perched on a high hill, the viewpoint provides a breathtaking glimpse of mist-covered valleys, dense forests, and waterfalls cascading through green slopes. Popular among trekkers and nature lovers, the journey to Neelimala is an adventure in itself, with a scenic trek through narrow trails lined with vibrant flora.",
    points: [
      "Offers sweeping views of misty valleys, lush forests, and cascading waterfalls.",
      "Accessible via a scenic trek through winding trails surrounded by diverse flora.",
      "A paradise for photographers with breathtaking landscapes and vibrant natural colors."
    ],
    rating: 4.8,
    reviews: 836,
    images: [
      "https://picsum.photos/seed/viewpoint1/400/500",
      "https://picsum.photos/seed/viewpoint2/300/200"
    ]
  });
  const [lat, setLat] = useState(11.6856); 
  const [lon, setLon] = useState(76.1310); 

  // Community Section
  const [comments, setComments] = useState([
    { user: "Rahul", text: "Amazing viewpoint! Totally worth the trek." },
    { user: "Meera", text: "The misty mornings here are unforgettable." }
  ]);

  const [contributions, setContributions] = useState([
    { user: "Anita", title: "Best Time to Visit", detail: "Early morning before 9 AM gives the best views." },
    { user: "Suresh", title: "Travel Tip", detail: "Carry water bottles and wear proper shoes for the trek." }
  ]);

  // Places, Hotels, Nearby Places
  const [places, setPlaces] = useState([
    { name: "Chembra Peak", location: "Millumukku, Kaniyambetta, Wayanad, Kerala 673122", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/place1/300/200" },
    { name: "Banasura Hill", location: "Millumukku, Kaniyambetta, Wayanad, Kerala 673122", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/place2/300/200" },
    { name: ".Brahmagiri Hills", location: "Millumukku, Kaniyambetta, Wayanad, Kerala 673122", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/place3/300/200" },
    { name: "Pakshipathalar", location: "Millumukku, Kaniya", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/place4/300/200" }
  ]);

  const [hotels, setHotels] = useState([
    { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel1/150/100" },
    { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel2/150/100" },
    { name: "DoubleTree by Hilton Hotel Orlando at SeaWorld", location: "Millumukku, Kaniyambetta, Wayanad, Kerala", distance: "15.2 km from centre", rating: 4.8, img: "https://picsum.photos/seed/hotel3/150/100" }
  ]);

  const [nearbyPlaces, setNearbyPlaces] = useState([
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby1/150/100" },
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby2/150/100" },
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby3/150/100" },
    { name: "Kuruva Island (Kuruvadweep)", location: "Millumukku, Kaniyambetta, Wayanad,", distance: "30 km", arrival: "12.00 am", time: "6 hr 30 min", img: "https://picsum.photos/seed/nearby4/150/100" }
  ]);

  // Weather
  const [weather, setWeather] = useState({
    temp: "",
    lastUpdated: "",
    wind: "",
    probability: "",
    pressure: "",
    dewPoint: "",
    humidity: "",
    cloudCover: "",
    uvIndex: "",
    visibility: "",
    precipitation: "",
    sunrise: "",
    airQuality: "",
    sunset: ""
  });

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState([
    "Road side Assistant",
    "Police Station",
    "Ambulance",
    "Local Support"
  ]);

  // Map Info
  const [mapInfo, setMapInfo] = useState({
    distance: "244 kM",
    arrival: "12.00 AM",
    time: "6hr 11Min",
    img: "https://i.imgur.com/k2e4b4C.png"
  });

  // Filters
  const [filters, setFilters] = useState({
    state: "Kerala",
    district: "Vayanad",
    terrain: "Mountain"
  });



useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const fetchWeather = async () => {
      try {
        // 1️⃣ Fetch Current Weather & Air Quality
        const currentRes = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`
        );
        const currentData = await currentRes.json();
        const current = currentData.current;

        // 2️⃣ Fetch Sunrise & Sunset from Astronomy API
        const astroRes = await fetch(
          `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${lat},${lon}&dt=${today}`
        );

        const astroData = await astroRes.json();
        const astro = astroData.astronomy.astro;
        const forecastRes = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1`
        );
        const forecastData = await forecastRes.json();

        // 3️⃣ Update state
        setWeather({
          temp: `${current.temp_c}°C`,
          lastUpdated: current.last_updated,
          wind: `${current.wind_kph} km/h (${current.wind_dir})`,
          probability: forecastData.forecast.forecastday[0].day.daily_chance_of_rain > 50 ? "High" : "Low",
          pressure: `${current.pressure_mb} mb`,
          dewPoint: `${current.dewpoint_c}°C`,
          humidity: `${current.humidity}%`,
          cloudCover: `${current.cloud}%`,
          uvIndex: current.uv,
          visibility: `${current.vis_km} km`,
          precipitation: `${current.precip_mm} mm`,
          sunrise: astro.sunrise,
          sunset: astro.sunset,
          airQuality: current.air_quality
            ? `CO: ${current.air_quality.co.toFixed(1)}, PM2.5: ${current.air_quality.pm2_5.toFixed(1)}`
            : "N/A"
        });
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
  }, [lat, lon]);





  return (
    <>
      <Header variant="dark" currentPage={currentPage} navigate={navigate} />

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-cover bg-center text-white flex items-center justify-center" style={{ backgroundImage: `url(${hero.bgImg})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center">
          <p className="text-xl">{hero.title}</p>
          <h1 className="text-5xl md:text-7xl font-bold my-4 leading-tight">{hero.subtitle}</h1>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96">
            <img src={about.images[0]} alt="Viewpoint" className="absolute top-0 left-0 w-2/3 h-full object-cover rounded-xl shadow-lg" />
            <img src={about.images[1]} alt="Viewpoint detail" className="absolute bottom-0 right-0 w-1/2 border-8 border-white rounded-xl shadow-2xl" />
            <div className="absolute top-4 right-8 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center space-x-2">
              <StarIcon className="text-yellow-400" />
              <span className="font-bold text-brand-dark">{about.rating}</span>
              <span className="text-xs text-brand-gray">Based on {about.reviews} Reviews</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-dark">{about.heading}</p>
            <h2 className="text-4xl font-bold text-brand-dark my-3">{about.subHeading}</h2>
            <p className="text-brand-gray mb-6">{about.description}</p>
            <ul className="space-y-3 text-brand-gray mb-8">
              {about.points.map((point, idx) => (
                <li key={idx} className="flex items-start"><CheckIcon className="text-brand-yellow mr-2 mt-1 flex-shrink-0" /> {point}</li>
              ))}
            </ul>
            <button className="bg-brand-yellow text-brand-dark font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">WishList</button>
          </div>
        </div>
      </section>

      {/* Comments & Contributions */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">Community Insights</h2>
          <div className="flex gap-6 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("comments")}
              className={`pb-2 font-semibold transition-colors ${
                activeTab === "comments" ? "border-b-2 border-brand-yellow text-brand-dark" : "text-brand-gray"
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab("contributions")}
              className={`pb-2 font-semibold transition-colors ${
                activeTab === "contributions" ? "border-b-2 border-brand-yellow text-brand-dark" : "text-brand-gray"
              }`}
            >
              Contributions
            </button>
          </div>
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: activeTab === "comments" ? "translateX(0%)" : "translateX(-50%)", width: "200%" }}
            >
              {/* Comments */}
              <div className="w-full pr-6">
                <div className="space-y-4">
                  {comments.map((c, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-100">
                      <p className="text-sm text-brand-dark font-semibold">{c.user}</p>
                      <p className="text-gray-600 text-sm mt-1">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Contributions */}
              <div className="w-full pl-6">
                <div className="space-y-4">
                  {contributions.map((c, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow border border-gray-100">
                      <h4 className="font-semibold text-brand-dark">{c.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{c.detail}</p>
                      <span className="text-xs text-brand-gray">Shared by {c.user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Places Section */}
      <section className="bg-brand-light-purple py-12 px-8">
        <div className="container mx-auto">
          <div className="bg-brand-dark rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 mb-10">
            <span className="text-white text-2xl font-bold">Filter</span>
            <div className="flex-grow flex flex-wrap items-center gap-4">
              <select className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto" value={filters.state} onChange={(e) => setFilters({...filters, state: e.target.value})}>
                <option>Kerala</option>
                <option>Karnataka</option>
              </select>
              <select className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto" value={filters.district} onChange={(e) => setFilters({...filters, district: e.target.value})}>
                <option>Wayanad</option>
                <option>Bengaluru</option>
              </select>
              <select className="flex-grow bg-white p-3 rounded-lg w-full sm:w-auto" value={filters.terrain} onChange={(e) => setFilters({...filters, terrain: e.target.value})}>
                <option>Mountain</option>
                <option>Hill</option>
              </select>
            </div>
            <button className="bg-brand-yellow text-brand-dark font-bold py-3 px-8 rounded-lg w-full sm:w-auto">SEARCH</button>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4">
              {places.map((place, index) => (
                <div key={index} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg p-4">
                  <img src={place.img} alt={place.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                  <h3 className="text-lg font-bold text-brand-dark">{place.name}</h3>
                  <p className="text-xs text-brand-gray mb-3 truncate">{place.location}</p>
                  <div className="text-xs text-brand-gray flex justify-between border-t pt-2">
                    <span>Distance: <b className="text-brand-dark">{place.distance}</b></span>
                    <span>Arrival: <b className="text-brand-dark">{place.arrival}</b></span>
                    <span>Time: <b className="text-brand-dark">{place.time}</b></span>
                  </div>
                  <button className="mt-3 w-full bg-brand-dark text-white font-semibold py-2.5 rounded-lg hover:bg-brand-dark/90">Lets Go</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
<section className="py-20 px-8">
  <div className="container mx-auto grid lg:grid-cols-3 gap-12">
    {/* Left Column */}
    <div className="lg:col-span-2 space-y-10">
      {/* Weather */}
      <div className="bg-brand-dark text-white rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-400">Current Weather</p>
            <div className="flex items-center">
              <WeatherIcon className="w-16 h-16 mr-2" />
              <span className="text-6xl font-bold">{weather.temp}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">Last updated {weather.lastUpdated}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <span>Wind speed: <b>{weather.wind}</b></span>
          <span>Probability: <b>{weather.probability}</b></span>
          <span>Pressure: <b>{weather.pressure}</b></span>
          <span>Dew point: <b>{weather.dewPoint}</b></span>
          <span>Humidity: <b>{weather.humidity}</b></span>
          <span>Cloud cover: <b>{weather.cloudCover}</b></span>
          <span>UV index: <b>{weather.uvIndex}</b></span>
          <span>Visibility: <b>{weather.visibility}</b></span>
          <span>Precipitation: <b>{weather.precipitation}</b></span>
          <span>Sunrise: <b>{weather.sunrise}</b></span>
          <span>Air quality: <b>{weather.airQuality}</b></span>
          <span>Sunset: <b>{weather.sunset}</b></span>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-2xl font-bold text-brand-dark mb-4">Emergency Contact Details</h3>
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center">
                <PhoneIcon className="mr-4 text-brand-dark" />
                <span className="font-semibold text-brand-dark">{contact}</span>
              </div>
              <div className="flex items-center space-x-4">
                <ExternalLinkIcon className="text-brand-gray cursor-pointer" />
                <ChevronDownIcon className="text-brand-gray cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotels & Resorts */}
      <div>
        <h3 className="text-2xl font-bold text-brand-dark mb-4">Hotels & Resorts</h3>
        <div className="space-y-4">
          {hotels.map((hotel, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-center shadow-sm">
              <img src={hotel.img} alt={hotel.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-grow">
                <h4 className="font-bold text-brand-dark">{hotel.name}</h4>
                <p className="text-xs text-brand-gray">{hotel.location}</p>
                <div className="flex items-center text-xs mt-1">
                  <LocationPinIcon className="w-3 h-3 mr-1 text-brand-gray"/>
                  <span>{hotel.distance}</span>
                  <a href="#" className="ml-2 text-blue-600 underline text-xs">Show on map</a>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-brand-yellow text-brand-dark font-bold text-sm px-2 py-1 rounded-md mb-3 inline-block">
                  <StarIcon className="inline w-3 h-3 mr-1" />
                  {hotel.rating}
                </div>
                <button className="bg-brand-dark text-white font-semibold py-2 px-5 rounded-lg text-sm">View More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Column */}
    <div className="space-y-10">
      {/* Map */}
      <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <img src={mapInfo.img} alt="Map" className="w-full h-auto object-cover" />
        <div className="bg-brand-dark text-white p-4 flex justify-around items-center text-center">
          <div>
            <p className="text-xs text-gray-400">Distance</p>
            <p className="font-bold text-lg">{mapInfo.distance}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Expected Arrival</p>
            <p className="font-bold text-lg">{mapInfo.arrival}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Estimated Time</p>
            <p className="font-bold text-lg">{mapInfo.time}</p>
          </div>
        </div>
      </div>

      {/* Nearby Places */}
      <div>
        <h3 className="text-2xl font-bold text-brand-dark mb-4">Nearby Places</h3>
        <div className="space-y-4">
          {nearbyPlaces.map((place, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-3 flex gap-4 items-center shadow-sm">
              <img src={place.img} alt={place.name} className="w-20 h-20 object-cover rounded-lg"/>
              <div className="flex-grow">
                <h4 className="font-bold text-sm text-brand-dark">{place.name}</h4>
                <p className="text-xs text-brand-gray mb-1">{place.location}</p>
                <div className="text-xs text-brand-gray flex space-x-2">
                  <span><b>{place.distance}</b></span>
                  <span><b>{place.arrival}</b></span>
                  <span><b>{place.time}</b></span>
                </div>
              </div>
              <button className="bg-brand-dark text-white font-semibold py-2 px-4 rounded-lg text-xs self-end">Lets Go</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

    </>
  );
};
