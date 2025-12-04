import React, { useEffect, useState } from "react";
import {
  Home as HomeIcon,
  Users as UsersIcon,
  MapPin as LocationIcon,
  Building2 as HotelIcon,
  BarChart2 as AnalyticsIcon,
  FileText as BlogIcon,
  Globe as GlobeIcon,
  MessageCircle as MessageCircleIcon,
  MapPinOff,
} from "lucide-react";

import AdminUsers from "./AdminUsers";
import AdminLocations from "./AdminLocation";
import AdminHotels from "./AdminHotel";
import AdminAnalysis from "./AdminAnalysis";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdminBlogs from "./AdminBlog";
import AdminContributor from "./AdminContributor";
import AdminComment from "./AdminComment";
import AdminDistricts from "./AdminDistricts";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const token = localStorage.getItem("token");
let userRole = null;
if (token) {
  const decoded = jwtDecode(token);
  userRole = decoded.role;
}

export const AdminPage = () => {
  const [activePage, setActivePage] = useState("home");

  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    uniqueUsers: 0,
    topLocations: [],
  });

  const [liveUsers, setLiveUsers] = useState([]); // ⭐ Live users state

  useEffect(() => {
    if (userRole) {
      const fetchAnalytics = async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/track/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const overall = res.data.overall || {};
          const topLocations = (res.data.byLocation || [])
            .sort((a, b) => b.totalVisits - a.totalVisits)
            .slice(0, 3)
            .map((loc) => loc._id);

          setAnalytics({
            totalVisits: overall.totalVisits || 0,
            uniqueUsers: res.data.uniqueUsers || 0,
            topLocations,
          });
        } catch (err) {
          console.error("Error fetching analytics:", err);
        }
      };

      // Fetch analytics once
      fetchAnalytics();
    }
  }, [token, userRole]);

  useEffect(() => {
    if (!userRole) return;

    const fetchLiveUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/track/live`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setLiveUsers(res.data.liveUsers);
        }
      } catch (err) {
        console.error("Live user error:", err);
      }
    };

    fetchLiveUsers();

    const interval = setInterval(fetchLiveUsers, 10000); // refresh every 10 sec
    return () => clearInterval(interval);
  }, [token, userRole]);

  const menuItems = [
    { id: "home", label: "Home", icon: <HomeIcon className="w-5 h-5" /> },
    {
      id: "locations",
      label: "Locations",
      icon: <LocationIcon className="w-5 h-5" />,
    },
    { id: "hotels", label: "Hotels", icon: <HotelIcon className="w-5 h-5" /> },
    { id: "blogs", label: "Blogs", icon: <BlogIcon className="w-5 h-5" /> },
    {
      id: "contributions",
      label: "Contributions",
      icon: <GlobeIcon className="w-5 h-5" />,
    },
    {
      id: "comments",
      label: "Comments",
      icon: <MessageCircleIcon className="w-5 h-5" />,
    },
    {
      id: "districts",
      label: "Districts",
      icon: <MapPinOff className="w-5 h-5" />,
    },

    ...(userRole === "admin"
      ? [
          {
            id: "analytics",
            label: "Analytics",
            icon: <AnalyticsIcon className="w-5 h-5" />,
          },
          {
            id: "users",
            label: "Users",
            icon: <UsersIcon className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activePage) {
      case "home":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-6">
              Dashboard Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-6 mb-10">
              {/* Total Visits */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold text-brand-gray">
                  Total Visits
                </h3>
                <p className="text-3xl font-bold text-brand-dark mt-2">
                  {analytics.totalVisits}
                </p>
              </div>

              {/* Unique Users */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold text-brand-gray">
                  Unique Users
                </h3>
                <p className="text-3xl font-bold text-brand-dark mt-2">
                  {analytics.uniqueUsers}
                </p>
              </div>

              {/* Top Locations */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold text-brand-gray">
                  Top Locations
                </h3>
                <ul className="text-brand-dark font-medium mt-2">
                  {analytics.topLocations.map((loc) => (
                    <li key={loc}>• {loc}</li>
                  ))}
                </ul>
              </div>

              {/* ⭐ Live Users */}
              <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold text-brand-gray">
                  Live Users (Last 60s)
                </h3>
                <p className="text-3xl font-bold text-brand-dark mt-2">
                  {liveUsers.length}
                </p>

                <ul className="text-brand-dark text-sm mt-3">
                  <ul className="text-brand-dark text-sm mt-3">
                    {liveUsers.slice(0, 5).map((u, i) => (
                      <li key={i}>• {u.username || "Anonymous"}</li>
                    ))}
                    {liveUsers.length > 5 && (
                      <li className="text-gray-500 text-xs mt-1">
                        + {liveUsers.length - 5} more...
                      </li>
                    )}
                  </ul>
                </ul>
              </div>
            </div>
          </div>
        );

      case "users":
        return <AdminUsers />;
      case "locations":
        return <AdminLocations />;
      case "hotels":
        return <AdminHotels />;
      case "analytics":
        return userRole === "admin" ? (
          <AdminAnalysis />
        ) : (
          <p className="p-6">Access Denied</p>
        );
      case "blogs":
        return <AdminBlogs />;
      case "contributions":
        return <AdminContributor />;
      case "comments":
        return <AdminComment />;
      case "districts":
        return <AdminDistricts />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-light-purple/10">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-100 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-brand-dark mb-8">Admin Panel</h1>

        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg font-medium transition-all ${
                activePage === item.id
                  ? "bg-brand-dark text-white shadow"
                  : "text-brand-dark hover:bg-brand-dark/10"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t text-sm text-gray-500">
          © {new Date().getFullYear()} Travel Admin
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};
