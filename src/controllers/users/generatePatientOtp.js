import { sequelize } from "../../config/db.js";
import User from "../../models/users/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";


export const generatePatientOTP = async (req, res) => {
  try {
    const { email, dob } = req.body;

    // Check if patient exists
    const patient = await User.findOne({
      where: { email, dateOfBirth: dob, role: "patient" },
    });

    if (!patient) {
      return res.status(400).json({ message: "Patient not found or incorrect details" });
    }

    // Generate a 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Store OTP using raw SQL
    await sequelize.query(
      "INSERT INTO OTP (email, otpCode, expiresAt) VALUES (?, ?, ?)",
      {
        replacements: [email, otpCode, expiresAt],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Send OTP to the patient via
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

   const currentYear = new Date().getFullYear();

const mailOptions = {
  from: process.env.EMAIL_ADDRESS,
  to: email,
  subject: "BP Record Verification OTP",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
      <h2 style="color: #333;">BP Record verification OTP Request</h2>
      <p style="font-size: 16px; color: #555;">Dear <b>${patient.firstName},</b><p> 
      <p style="font-size: 16px; color: #555;">Your OTP for BP record is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #ff6600; text-align: center;">${otpCode}</p>
      <p style="font-size: 14px; color: #777;">This OTP is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${currentYear} The Ogeri Health Foundation. All rights reserved.</p>
    </div>
  `,
};


await transporter.sendMail(mailOptions);
      
    return res.status(200).json({
      message: "OTP sent successfully. It is valid for 15 minutes.",
    });

  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({ message: "Unable to generate OTP", error: error.message });
  }
};
