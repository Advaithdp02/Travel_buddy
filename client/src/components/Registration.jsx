import React, { useState } from "react";

import { LocationIcon } from "./Icons";
import { useNavigate } from "react-router-dom";

export const Registration = ({ currentPage }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email/Phone, Step 1.5: OTP, Step 2: Full form
  const [loading, setLoading] = useState(false);

  // Step 1
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Step 2: Registration fields
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    dob: "",
    location: "",
  });

  // Generate OTP
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otpCode); // Send this via backend in real app
    setGeneratedOtp(otpCode);

    setTimeout(() => {
      setLoading(false);
      setStep(1.5);
    }, 1000);
  };

  // Verify OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      alert("OTP Verified ✅");
      setStep(2);
    } else {
      alert("Invalid OTP ❌");
    }
  };

  // Final Registration API call
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      username: formData.username,
      password: formData.password,
      location: formData.location,
      dob: formData.dob,
      phone,
      email,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Registration failed");
      }

      const data = await res.json();
      console.log("Registration successful:", data);

      // Store token & userId in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("isLoggedIn", "true");

      alert("Registration Complete 🎉");
      navigate("/");
    } catch (err) {
      console.error("Registration Error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-white min-h-screen flex flex-col">
      

      <div className="flex flex-1 items-center justify-center px-8 py-16">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="w-14 h-14 bg-brand-light-purple rounded-full flex items-center justify-center">
                <LocationIcon className="w-8 h-8 text-brand-dark" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-brand-dark">Create Account</h2>
            <p className="text-brand-gray mt-2">Register to start your journey</p>
          </div>

          {/* Step 1: Email + Phone */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90"
              >
                {loading ? "Sending OTP..." : "Next"}
              </button>
            </form>
          )}

          {/* Step 1.5: OTP Verification */}
          {step === 1.5 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90"
              >
                Verify OTP
              </button>
            </form>
          )}

          {/* Step 2: Full Registration Form */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Place / Location</label>
                <input
                  type="text"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-brand-gray mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-brand-yellow font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
