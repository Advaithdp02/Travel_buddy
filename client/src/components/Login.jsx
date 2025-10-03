import React, { useState } from "react";
import { Header } from "./Header";
import { LocationIcon } from "./Icons"; // example icon, you can replace with LockIcon if you add one
import { useNavigate } from "react-router-dom";

export const Login = ({ currentPage }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login details:", { email, password });
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userEmail", email);
    alert("Login successful (demo)");
    navigate("/"); 

  };

  return (
    <>
      <section className="relative bg-white min-h-screen flex flex-col">
        <Header currentPage={currentPage} navigate={navigate} />

        <div className="flex flex-1 items-center justify-center px-8 py-16">
          <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="w-14 h-14 bg-brand-light-purple rounded-full flex items-center justify-center">
                  <LocationIcon className="w-8 h-8 text-brand-dark" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-brand-dark">Welcome Back</h2>
              <p className="text-brand-gray mt-2">Login to continue exploring</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105"
              >
                LOGIN
              </button>
            </form>

            <p className="text-center text-sm text-brand-gray mt-6">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-brand-yellow font-semibold hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
