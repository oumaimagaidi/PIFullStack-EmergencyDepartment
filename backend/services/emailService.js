// services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Envoyer l'OTP par email
export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 40px;
                  margin: 0;
                  text-align: center;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  padding: 30px;
                  text-align: center;
              }
              h1 {
                  color: #333;
                  font-size: 24px;
                  margin-bottom: 20px;
              }
              .otp-code {
                  font-size: 32px;
                  font-weight: bold;
                  color: #007BFF;
                  padding: 10px;
                  border: 2px solid #007BFF;
                  display: inline-block;
                  margin-bottom: 20px;
              }
              .expiration {
                  color: #555;
                  font-size: 14px;
                  margin-top: 10px;
              }
              .footer {
                  margin-top: 30px;
                  color: #888;
                  font-size: 12px;
              }
              .footer a {
                  color: #007BFF;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>OTP Verification</h1>
              <p>Your OTP code is:</p>
              <div class="otp-code">${otp}</div>
              <p class="expiration">It will expire in 5 minutes.</p>
              <div class="footer">
                  <p>If you didn't request this, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>`,
  };

  await transporter.sendMail(mailOptions);
};