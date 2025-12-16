import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function LocationBulkAddModal({ open, onClose, onUpload }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);
  const [verified, setVerified] = useState(false);

  const sendOTP = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) return alert("User email not found. Please login again.");

      await axios.post(`${BACKEND_URL}/locations/bulk/send-otp`, { email });
      setOtpSent(true);
      alert("OTP sent to your email!");
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP.");
    }
  };

  const verifyOTP = async () => {
    try {
      const email = localStorage.getItem("userEmail");

      const res = await axios.post(
        `${BACKEND_URL}/locations/bulk/verify-otp`,
        { email, otp }
      );

      if (res.data.success) {
        setVerified(true);
        setOtp("");
        setOtpSent(false);
        alert("OTP Verified!");
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed.");
    }
  };

  const handleUploadClick = () => {
    if (!verified) return alert("Verify OTP first");
    if (!file) return alert("Select a file first");

    onUpload({ file });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="absolute top-1/2 left-1/2 bg-white rounded-lg shadow-xl"
        style={{
          transform: "translate(-50%, -50%)",
          width: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <Typography variant="subtitle1" className="mb-2 font-semibold">
          Secure Bulk Upload
        </Typography>

        {!otpSent && !verified && (
          <Button size="small" variant="contained" onClick={sendOTP}>
            Send OTP to Email
          </Button>
        )}

        {otpSent && (
          <>
            <Typography className="mt-3 text-sm">Enter OTP:</Typography>
            <input
              type="text"
              className="border p-2 rounded w-full mt-2 text-sm"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              size="small"
              variant="contained"
              className="mt-3"
              onClick={verifyOTP}
            >
              Verify OTP
            </Button>
          </>
        )}

        {verified && (
          <>
            <Typography className="mt-4 text-sm font-medium">
              Select File (Excel / CSV / JSON)
            </Typography>

            <input
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              className="w-full mt-2 mb-3 text-sm"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <Box
              className="p-3 rounded-md bg-gray-100 border text-xs"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              <Typography className="font-semibold mb-1">
                Required Columns
              </Typography>

              <ul className="list-disc ml-4">
                <li><b>name</b> (required)</li>
                <li><b>description</b> (required)</li>
                <li><b>subtitle</b> (optional)</li>
                <li><b>points</b> (optional)</li>
                <li><b>longitude</b> (required)</li>
                <li><b>latitude</b> (required)</li>
                <li><b>terrain</b> (required)</li>
                <li><b>review</b> (optional)</li>
                <li><b>reviewLength</b> (optional)</li>
                <li><b>roadSideAssistant</b> (optional)</li>
                <li><b>policeStation</b> (optional)</li>
                <li><b>ambulance</b> (optional)</li>
                <li><b>localSupport</b> (optional)</li>
              </ul>

              <Typography className="mt-2 font-semibold">
                ⚠️ District is auto-assigned
              </Typography>

              <Typography className="mt-1">
                Images cannot be uploaded in bulk.
              </Typography>

              <Typography className="mt-2 font-semibold">
                Example Row
              </Typography>

              <Box className="mt-1 p-2 bg-white rounded border text-[11px]">
{`name: "Nandi Hills"
description: "Beautiful hill station"
subtitle: "Sunrise Viewpoint"
points: "Trekking, Viewpoint"
longitude: 77.683
latitude: 13.370
terrain: "Mountain"`}
              </Box>
            </Box>

            <Button
              size="small"
              variant="contained"
              className="mt-3"
              onClick={handleUploadClick}
            >
              Upload Bulk Data
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
