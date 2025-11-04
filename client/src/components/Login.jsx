import React, { useState, useEffect } from "react";

import { LocationIcon } from "./Icons";
import { useNavigate } from "react-router-dom";

export const Login = ({ currentPage }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // backend URL from .env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    // If already logged in, redirect to homepage
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token + userId in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("isLoggedIn", "true");

      alert("Login successful ✅");
      navigate("/"); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-[#fbebff] min-h-screen flex flex-col">
     

      <div className="flex flex-1 items-center justify-center px-8 py-16">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="w-14 h-14 bg-brand-light-purple rounded-full flex items-center justify-center">
                <LocationIcon className="w-8 h-8 text-[#310a49]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#310a49]">Welcome Back</h2>
            <p className="text-brand-gray mt-2">Login to continue exploring</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#310a49] mb-2">
                Email or Username
              </label>
              <input
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#310a49] focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#310a49] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[#310a49] focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#9156F1] text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-[#310a49]/90 transition-transform transform hover:scale-105 disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-gray mt-6">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-[#9156F1] font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
export default Login;