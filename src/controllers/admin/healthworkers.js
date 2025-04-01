import User from "../../models/users/User.js";
import healthWorkerProfile from "../../models/users/HealthWorkerProfile.js";
import Consultation from "../../models/users/consultation.js";
import BPReading from "../../models/users/BPReading.js";

export const getAllHealthworkers = async (req, res) => {
  try {
    // Fetch all users where role is "patient"
    const healthWorkers = await User.findAll({
      where: { role: "health_worker" },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "gender",
        "dateOfBirth",
        "phone",
        "address",
      ], 
    });

    // Calculate total patients based on the retrieved list
    const totalHealthworkers = healthWorkers.length;

    // Check if patients exist
    if (!healthWorkers.length) {
      return res
        .status(404)
        .json({ message: "No health worker(s) found.", totalHealthworkers: 0 });
    }

    // Return patients data and total count
    return res
      .status(200)
      .json({ success: true, totalHealthworkers, data: healthWorkers });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// get health worker details
export const getHealthworkerDetails = async (req, res) => {
  try {
    const { healthWorkerId } = req.params;

    if (!healthWorkerId) {
      return res.status(400).json({ message: "Health Worker ID is required" });
    }

    // Fetch the health worker from the Users table
    const healthWorker = await User.findOne({
      where: { id: healthWorkerId, role: "health_worker" },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "role",
        "gender",
        "dateOfBirth",
        "phone",
        "address",
      ],
    });

    if (!healthWorker) {
      return res.status(404).json({ message: "No record found." });
    }

    // Fetch the health worker's profile from the HealthWorkerProfiles table
    const workerProfile = await healthWorkerProfile.findOne({
      where: { userId: healthWorkerId },
      attributes: [
        "id",
        "role",
        "Specialization",
        "Qualifications",
        "WorkExperience",
        "userId",
        "createdAt",
        "updatedAt",
      ],
    });

    return res.status(200).json({
      message: "Health worker details retrieved successfully",
      biodata: healthWorker,
      professionalProfile:
        workerProfile ||
        "No professional profile found for this health worker.",
    });
  } catch (error) {
    console.error("Error fetching health worker details:", error);
    return res.status(500).json({
      message: "Unable to fetch health worker details",
      error: error.message,
    });
  }
};

// get patient details

export const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Fetch patient's biodata
    const patient = await User.findOne({
      where: { id: patientId, role: "patient" },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "role",
        "gender",
        "dateOfBirth",
        "phone",
        "address",
      ],
    });

    if (!patient) {
      return res.status(404).json({
        message: "No record found for this patient.",
      });
    }

    // Fetch patient's consultation notes
    const consultations = await Consultation.findAll({
      where: { userId: patientId },
      attributes: [
        "id",
        "healthWorkerId",
        "userId",
        "consultationNotes",
        "prescription",
        "allergies",
        "sideEffects",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "healthWorker",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "dateOfBirth",
          ],
        },
      ],
    });

    // Fetch patient's BP readings, ordered by most recent first
    const bpReadings = await BPReading.findAll({
      where: { patientId },
      order: [["createdAt", "DESC"]], // Ensures most recent readings are first
      attributes: [
        "id",
        "systolic",
        "diastolic",
        "heartRate",
        "measurementLocation",
        "measuredBy",
        "createdAt",
        "updatedAt",
      ],
    });

    let averageSystolic = 0;
    let averageDiastolic = 0;
    let lastSystolic = "No data available";
    let lastDiastolic = "No data available";

    if (bpReadings.length > 0) {
      // Calculate averages
      const totalSystolic = bpReadings.reduce(
        (sum, record) => sum + record.systolic,
        0
      );
      const totalDiastolic = bpReadings.reduce(
        (sum, record) => sum + record.diastolic,
        0
      );
      averageSystolic = (totalSystolic / bpReadings.length).toFixed(2);
      averageDiastolic = (totalDiastolic / bpReadings.length).toFixed(2);

      // Get the most recent BP reading (first item in already sorted array)
      lastSystolic = bpReadings.length -1?.systolic || "No data available";
      lastDiastolic = bpReadings.length -1?.diastolic || "No data available";

      console.log("Most Recent Systolic:", lastSystolic);
      console.log("Most Recent Diastolic:", lastDiastolic);
    }

    return res.status(200).json({
      message: "Patient's details retrieved successfully",
      biodata: patient,
      consultationNotes:
        consultations.length > 0 ? consultations : "No consultations found.",
      bpReadings:
        bpReadings.length > 0
          ? {
              message: "BP readings retrieved successfully",
              averageSystolic,
              averageDiastolic,
              lastSystolic,
              lastDiastolic,
              data: bpReadings,
            }
          : "No BP readings found for this patient.",
    });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return res.status(500).json({
      message: "An error occurred while fetching patient details.",
      error: error.message,
    });
  }
};
