import React, { useState } from "react";
import { UserAddIcon } from "./Icons";
import { useNavigate } from "react-router-dom";

export const Registration = ({ currentPage }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email/Phone, Step 1.5: OTP, Step 2: Full form
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // Step 1
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Step 2: Registration fields
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    dob: "",
    location: "",
  });

  // Step 1: Request backend to send OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/contact/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to send OTP");
      }

      alert("OTP sent to your email ✅");
      setStep(1.5);
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1.5: Verify OTP via backend
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/contact/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "OTP verification failed");
      }

      alert("OTP Verified ✅");
      setStep(2);
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Final registration
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
      const res = await fetch(`${BACKEND_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Registration failed");
      }

      const data = await res.json();
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
    <section className=" bg-[#fbebff] min-h-screen flex flex-col">
      <div className="flex flex-1 items-center justify-center px-8 py-16">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="w-14 h-14 bg-brand-light-purple rounded-full flex items-center justify-center">
                <UserAddIcon className="w-8 h-8 text-[#310a49]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#310a49]">Create Account</h2>
            <p className="text-brand-gray mt-2">Register to start your journey</p>
          </div>

          {/* Step 1: Email + Phone */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#310a49] mb-2">Email</label>
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
                <label className="block text-sm font-semibold text-[#310a49] mb-2">Phone Number</label>
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
                className="w-full bg-[#9156F1] text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-[#310a49]/90"
              >
                {loading ? "Sending OTP..." : "Next"}
              </button>
            </form>
          )}

          {/* Step 1.5: OTP Verification */}
          {step === 1.5 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#310a49] mb-2">Enter OTP</label>
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
                disabled={loading}
                className="w-full bg-[#9156F1] text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-[#310a49]/90"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {/* Step 2: Full Registration Form */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Name, Username, Password, Location, DOB inputs */}
              {["name", "username", "password", "location", "dob"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-[#310a49] mb-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "password" ? "password" : field === "dob" ? "date" : "text"}
                    placeholder={`Enter your ${field}`}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9156F1] text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-[#fbebff]/90"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-brand-gray mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#9156F1] font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
