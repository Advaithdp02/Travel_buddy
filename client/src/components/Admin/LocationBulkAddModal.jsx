import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function LocationBulkAddModal({ open, onClose, onUpload }) {
  const [email] = useState("reandletravelbuddy@gmail.com");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);
  const [verified, setVerified] = useState(false);

  const sendOTP = async () => {
    try {
      await axios.post(`${BACKEND_URL}/locations/bulk/send-otp`, { email });
      setOtpSent(true);
      alert("OTP sent to admin email!");
    } catch {
      alert("Failed to send OTP.");
    }
  };

  const verifyOTP = async () => {
  try {
    const res = await axios.post(`${BACKEND_URL}/locations/bulk/verify-otp`, {
      email,
      otp,
    });

    if (res.data.success) {
      setVerified(true);
      setOtp("");        // CLEAR OTP BOX
      setOtpSent(false); // HIDE OTP INPUT SECTION
      alert("OTP Verified!");
    } else {
      alert("Invalid OTP");
    }
  } catch {
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
        className="absolute top-1/2 left-1/2 bg-white p-6 rounded-xl shadow-xl"
        style={{ transform: "translate(-50%, -50%)", width: "480px" }}
      >
        <Typography variant="h6" className="mb-3 font-bold">
          Secure Bulk Upload
        </Typography>

        {!otpSent ? (
          <Button variant="contained" onClick={sendOTP}>
            Send OTP to Email
          </Button>
        ) : (
          <>
            <Typography className="mt-4">Enter OTP:</Typography>
            <input
              type="text"
              className="border p-2 rounded w-full mt-2"
              placeholder="Enter 6-digit OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button variant="contained" className="mt-3" onClick={verifyOTP}>
              Verify OTP
            </Button>
          </>
        )}

        {verified && (
          <>
            <Typography className="mt-6">
              Select File (Excel / CSV / JSON)
            </Typography>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              className="w-full mt-2 mb-4"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Box className="mt-4 p-3 rounded-lg bg-gray-100 border text-sm">
              <Typography variant="subtitle2" className="font-bold mb-2">
                Required File Format
              </Typography>

              <Typography className="mb-1">
                Your Excel / CSV / JSON must contain the following columns:
              </Typography>

              <ul className="list-disc ml-5">
                <li>
                  <b>name</b> — Location name (required)
                </li>
                <li>
                  <b>description</b> — Short description (required)
                </li>
                <li>
                  <b>subtitle</b> — Small subtitle text (optional)
                </li>
                <li>
                  <b>points</b> — Comma-separated highlight points (optional)
                </li>
                <li>
                  <b>longitude</b> — Required
                </li>
                <li>
                  <b>latitude</b> — Required
                </li>
                <li>
                  <b>terrain</b> — Example: Mountain, Beach, Forest, Rocky,
                  Urban… (required)
                </li>
                <li>
                  <b>review</b> — Numeric rating (optional)
                </li>
                <li>
                  <b>reviewLength</b> — Rating count (optional)
                </li>
                <li>
                  <b>roadSideAssistant</b> (optional)
                </li>
                <li>
                  <b>policeStation</b> (optional)
                </li>
                <li>
                  <b>ambulance</b> (optional)
                </li>
                <li>
                  <b>localSupport</b> (optional)
                </li>
              </ul>

              <Typography className="mt-3 font-semibold">
                ⚠️ Note: District is NOT needed — it is chosen automatically.
              </Typography>

              <Typography className="mt-1">
                Images cannot be uploaded in bulk. Add images manually after
                upload.
              </Typography>

              <Typography className="mt-3 font-semibold">
                Example Row:
              </Typography>
              <Box className="mt-1 p-2 bg-white rounded border text-xs">
                {`name: "Nandi Hills"
            description: "Beautiful hill station"
            subtitle: "Sunrise Viewpoint"
            points: "Trekking, Viewpoint, Nature"
            longitude: 77.683
            latitude: 13.370
            terrain: "Mountain"
            review: 4.7
            reviewLength: 1050
            policeStation: "Nandi Outpost"
            ambulance: "108"
            localSupport: "Local Guide Available"`}
              </Box>

              <Typography className="mt-3">
                Supported formats: <b>.xlsx, .xls, .csv, .json</b>
              </Typography>
            </Box>

            <Button variant="contained" onClick={handleUploadClick}>
              Upload Bulk Data
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
