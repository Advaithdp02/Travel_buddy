import nodemailer from "nodemailer";

export const contactUs = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const recipient = process.env.CONTACT_EMAIL;
  if (!recipient) {
    return res.status(500).json({ message: "Recipient email not defined in env" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER, // must be verified sender
      to: recipient,
      subject: `[Contact Us] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};


const otpStore = new Map();

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with expiry (5 mins)
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "No OTP found for this email" });
  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  // OTP is correct, delete it from store
  otpStore.delete(email);

  res.status(200).json({ message: "OTP verified successfully" });
};