import BPReading from "../../models/users/BPReading.js";
import User from "../../models/users/User.js";

export const addBP = async (req, res) => {
  try {
    // Extract patientId and BP details from request body
    const {
      systolic,
      diastolic,
      heartRate,
      measurementLocation,
      measuredBy,
      patientId,
    } = req.body;

    // Check if the provided patientId belongs to a valid patient or health worker
    const patient = await User.findOne({
      where: {
        id: patientId,
        role: ["patient", "health_worker"], // Sequelize will handle this as an OR condition
      },
    });

    if (!patient) {
      return res.status(400).json({ message: "Invalid patient ID or user" });
    }

    // Create a new BP reading
    const newBP = await BPReading.create({
      systolic,
      diastolic,
      heartRate,
      measurementLocation,
      measuredBy,
      patientId: patientId, // Always linked to a patient
    });

    return res.status(201).json({
      message: "BP reading added successfully",
      data: newBP,
    });
  } catch (error) {
    console.error("Error adding BP reading:", error);
    return res
      .status(500)
      .json({ message: "Unable to add BP reading", error: error.message });
  }
};

/**
 * @desc Fetch a single BP reading belonging to a specific patient
 * @route GET /bp/:id
 */

export const fetchBP = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "BP reading ID is required" });
    }

    const findBP = await BPReading.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "patient", // 🔥 Use the correct alias from associations
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    });

    if (!findBP) {
      return res.status(404).json({ message: "BP reading not found" });
    }

    // 🔥 Correct way to access associated user role
    if (findBP.user && findBP.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "BP reading does not belong to a patient" });
    }

    return res.status(200).json({
      message: "BP reading retrieved successfully",
      data: findBP,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch BP reading" });
  }
};

/**
 * @desc Fetch all BP readings for a specific patient
 * @route GET /bp/patient/:patientId
 */
export const fetchAllBPForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // Validate that the user is a patient
    const patient = await User.findOne({
      where: { id: patientId, role: "patient" },
    });

    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found or is not a valid patient" });
    }

    // Fetch all BP readings for the patient
    const bpReadings = await BPReading.findAll({
      where: { patientId },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "systolic", "diastolic", "measurementLocation", "measuredBy", "patientId", "createdAt", "updatedAt"],
    });

    if (!bpReadings.length) {
      return res
        .status(404)
        .json({ message: "No BP readings found for this patient" });
    }

    // Calculate averages
    const totalReadings = bpReadings.length;
    const totalSystolic = bpReadings.reduce((sum, reading) => sum + reading.systolic, 0);
    const totalDiastolic = bpReadings.reduce((sum, reading) => sum + reading.diastolic, 0);

    const averageSystolic = (totalSystolic / totalReadings).toFixed(2);
    const averageDiastolic = (totalDiastolic / totalReadings).toFixed(2);

    // Get the last BP reading values
    const lastBPReading = bpReadings[0]; // First item in the sorted array
    const lastSystolic = lastBPReading.systolic;
    const lastDiastolic = lastBPReading.diastolic;

    return res.status(200).json({
      message: "BP readings retrieved successfully",
      averageSystolic,
      averageDiastolic,
      lastSystolic,
      lastDiastolic,
      data: bpReadings,
    });

  } catch (error) {
    console.error("Error fetching BP readings:", error);
    return res.status(500).json({ message: "Unable to fetch BP readings", error: error.message });
  }
};

/**
 * @desc Fetch all BP readings (for all patients)
 * @route GET /bp
 */
export const fetchAllBP = async (req, res) => {
  try {
    const bpReadings = await BPReading.findAll({
      include: [
        {
          model: User,
          as: "patient", // 🔥 Ensure this matches the alias in User.js
          attributes: ["id", "firstName", "lastName", "role"],
          where: { role: "patient" }, // Ensures BP readings are only from patients
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!bpReadings.length) {
      return res.status(404).json({ message: "No BP readings found" });
    }

    return res.status(200).json({
      message: "All BP readings retrieved successfully",
      data: bpReadings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch BP readings" });
  }
};

export const updateBP = async (req, res) => {
  try {
    const { id } = req.params;
    const { systolic, diastolic, heartRate, measurementLocation, measuredBy } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "BP reading ID is required" });
    }

    // Validate input data
    if (
      !systolic ||
      !diastolic ||
      !heartRate ||
      !measurementLocation ||
      !measuredBy
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the BP reading by ID
    const findBP = await BPReading.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "patient", // Assuming the alias used in the association
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    });

    if (!findBP) {
      return res.status(404).json({ message: "BP reading not found" });
    }

    // Check if the BP reading belongs to a patient
    if (findBP.user && findBP.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "BP reading does not belong to a patient" });
    }

    // Update the BP reading
    await findBP.update({
      systolic,
      diastolic,
      heartRate,
      measurementLocation,
      measuredBy,
    });

    return res.status(200).json({
      message: "BP reading updated successfully",
      data: findBP,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to update BP reading" });
  }
};
