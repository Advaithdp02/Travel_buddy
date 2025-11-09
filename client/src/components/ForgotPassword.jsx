import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!email) return setMessage("Please enter your email");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setOtpSent(true);
    } catch (err) {
      setMessage("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) return setMessage("Enter the OTP sent to your email");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        alert("✅ OTP verified successfully!");
        setOtpVerified(true);
      }
    } catch (err) {
      setMessage("Failed to verify OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword) return setMessage("Enter a new password");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        alert("🎉 Password reset successful! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      setMessage("Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbebff]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-[#310a49] mb-4 text-center">
          Forgot Password
        </h2>

        {/* Step 1: Enter Email */}
        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4"
            />
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-[#9156F1] text-white py-2 rounded-lg hover:bg-[#7b46d6] transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            {/* Step 2: Verify OTP */}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded-lg mb-3"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otpVerified}
              className="w-full bg-[#9156F1] text-white py-2 rounded-lg hover:bg-[#7b46d6] transition disabled:opacity-50 mb-4"
            >
              {otpVerified ? "OTP Verified" : loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Step 3: Reset Password (only visible after OTP verified) */}
            {otpVerified && (
              <>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border p-3 rounded-lg mb-3"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </>
        )}

        {message && (
          <p className="text-sm text-center text-gray-600 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
