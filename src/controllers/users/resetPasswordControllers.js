import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../../models/users/User.js";
import OTP from "../../models/users/otpModel.js";
import bcrypt from "bcryptjs";

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

    // Store OTP in the database
    await OTP.create({
      email,
      otpCode,
      expiresAt,
    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

   const mailOptions = {
  from: process.env.EMAIL_ADDRESS,
  to: email,
  subject: "Password Reset OTP",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #555;">
        Your OTP for password reset is:
      </p>
      <p style="font-size: 24px; font-weight: bold; color: #ff6600; text-align: center;">
        ${otpCode}
      </p>
      <p style="font-size: 14px; color: #777;">
        This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        &copy; ${new Date().getFullYear()} Ogeri Health Foundation. All Rights Reserved.
      </p>
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


// verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Check if OTP exists and is valid
    const otpRecord = await OTP.findOne({
      where: { email, otpCode },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    // OTP is valid; allow the user to proceed to reset password
    return res.status(200).json({ message: "OTP verified successfully. Proceed to reset password." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Error verifying OTP." });
  }
};


// RESET PASSWORD

export const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    // Check if OTP exists and is valid
    const otpRecord = await OTP.findOne({ where: { email, otpCode } });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.update(
      { password: hashedPassword },
      { where: { email } }
    );

    // Delete the OTP record after successful password reset
    await OTP.destroy({ where: { email } });

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Error resetting password." });
  }
};

