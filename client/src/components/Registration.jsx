import React, { useState } from "react";
import { Header } from "./Header";
import { LocationIcon } from "./Icons"; // Replace with a user/lock icon if you have one
import { useNavigate } from "react-router-dom";

export const Registration = ({ currentPage }) => {
    const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [formData, setFormData] = useState({ name: "", place: "", age: "" });
  const [loading, setLoading] = useState(false);

  
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate OTP generation
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otpCode); // In real app, send via backend
    setGeneratedOtp(otpCode);

    setTimeout(() => {
      setLoading(false);
      setStep(1.5); // Move to OTP step
    }, 1000);
  };

  
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      alert("OTP Verified ✅");
      setStep(2);
    } else {
      alert("Invalid OTP ❌");
    }
  };

  
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const data = { email, phone, ...formData };
    console.log("Final Registration Data:", data);
    alert("Registration Complete 🎉");
    navigate("/login");  
  };

  return (
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
            <h2 className="text-3xl font-bold text-brand-dark">Create Account</h2>
            <p className="text-brand-gray mt-2">Register to start your journey</p>
          </div>

          {/* Step 1: Email + Phone */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
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
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105"
              >
                {loading ? "Sending OTP..." : "Next"}
              </button>
            </form>
          )}

          {/* Step 1.5: OTP Verification */}
          {step === 1.5 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105"
              >
                Verify OTP
              </button>
            </form>
          )}

          {/* Step 2: Name, Place, Age */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Place
                </label>
                <input
                  type="text"
                  placeholder="Enter your place"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-brand-dark/90 transition-transform transform hover:scale-105"
              >
                Register
              </button>
            </form>
          )}

          {/* Already have account */}
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
