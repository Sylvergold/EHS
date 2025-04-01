import { sequelize } from "../../config/db.js";
import User from "../../models/users/User.js";
import BPReading from "../../models/users/BPReading.js";

export const addBPByHealthWorker = async (req, res) => {
  try {
    const { systolic, diastolic, heartRate, measurementLocation, measuredBy, patientEmail, otp } = req.body;

    // Check if patient exists
    const patient = await User.findOne({
      where: { email: patientEmail, role: "patient" },
    });

    if (!patient) {
      return res.status(400).json({ message: "Patient not found" });
    }

    // Verify OTP using raw SQL
    const [otpRecords] = await sequelize.query(
      "SELECT * FROM OTP WHERE email = ? AND otpCode = ? LIMIT 1",
      {
        replacements: [patientEmail, otp],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!otpRecords) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check OTP expiration
    if (new Date() > new Date(otpRecords.expiresAt)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Create BP record
    const newBP = await BPReading.create({
      systolic,
      diastolic,
      heartRate,
      measurementLocation,
      measuredBy,
      patientId: patient.id, // Ensure it's linked to the correct patient
    });

    // Delete OTP after successful verification
    await sequelize.query("DELETE FROM OTP WHERE email = ?", {
      replacements: [patientEmail],
      type: sequelize.QueryTypes.DELETE,
    });

    return res.status(201).json({
      message: "BP reading added successfully",
      data: newBP,
    });

  } catch (error) {
    console.error("Error adding BP reading:", error);
    return res.status(500).json({ message: "Unable to add BP reading", error: error.message });
  }
};
