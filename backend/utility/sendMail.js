import { createTransport } from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendMail = async (email, subject, html) => {
  try {
    const mailTransporter = getTransporter();
    await mailTransporter.sendMail({
      from: `"${process.env.APP_NAME || 'Auth Service'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email could not be sent. Please try again later.");
  }
};
