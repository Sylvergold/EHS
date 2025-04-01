import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sequelize } from "../../config/db.js";
import User from "../../models/users/User.js";

// Generate and send OTP
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User with this email not found." });
    }

    // Generate a 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Store OTP using raw SQL
    await sequelize.query(
      `INSERT INTO OTP (email, otpCode, expiresAt) VALUES (?, ?, ?)`,
      { replacements: [email, otpCode, expiresAt] }
    );

    // Send OTP via email
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
  subject: "Password Reset OTP",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #555;"><b>Dear ${user.firstName},</b></p>
      <p style="font-size: 16px; color: #555;">Your OTP for password reset is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #ff6600; text-align: center;">${otpCode}</p>
      <p style="font-size: 14px; color: #777;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${currentYear} The Ogeri Health Foundation. All rights reserved.</p>
    </div>
  `,
};


    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent successfully. Check your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Error generating OTP." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Retrieve OTP using raw SQL
    const [otpResult] = await sequelize.query(
      `SELECT * FROM OTP WHERE email = ? AND otpCode = ?`,
      { replacements: [email, otpCode] }
    );

    if (otpResult.length === 0) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP has expired
    const otpRecord = otpResult[0];
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    return res.status(200).json({ message: "OTP verified successfully. Proceed to reset password." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Error verifying OTP." });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check if the user exists
    const [userResult] = await sequelize.query(`SELECT * FROM users WHERE email = ?`, {
      replacements: [email],
    });

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    // Retrieve OTP
    const [otpResult] = await sequelize.query(`SELECT * FROM OTP WHERE email = ? AND otpCode = ?`, {
      replacements: [email, otpCode],
    });

    if (otpResult.length === 0) {
      return res.status(400).json({ message: "Invalid OTP. Please enter the correct code." });
    }

    // Check if OTP has expired
    const otpRecord = otpResult[0];
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    // Hash the new password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ message: "Server error while encrypting password." });
    }

    // Update user's password
    const [updateResult] = await sequelize.query(
      `UPDATE users SET password = ?, updatedAt = NOW() WHERE email = ?`,
      { replacements: [hashedPassword, email] }
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to update password. Please try again." });
    }

    // Delete the OTP record
    await sequelize.query(`DELETE FROM OTP WHERE email = ?`, { replacements: [email] });

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
  }
};
