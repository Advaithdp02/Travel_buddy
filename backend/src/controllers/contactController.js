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
