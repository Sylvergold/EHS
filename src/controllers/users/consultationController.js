import Consultation from '../../models/users/consultation.js';
import User from '../../models/users/User.js';

export const addConsultation = async (req, res) => {
  try {
    //validation required for body
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: 'Provide a consultation note' });
    }
    const newConsult = await Consultation.create(data);
    return res.status(200).json({
      message: 'Consultation note added successfully',
      data: newConsult,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unable to add consultation note' });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL
    const data = req.body;

    // Check if the consultation exists
    const consultation = await Consultation.findByPk(id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Update consultation
    await consultation.update(data);

    return res.status(200).json({
      message: "Consultation record updated successfully",
      consultation,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Unable to update consultation record" });
  }
};


export const fetchConHx = async (req, res) => {
  try {
    //validation needed
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Provide a consultation ID' });
    }
    const findConHx = await Consultation.findOne({ where: {id: id} });
    if (!findConHx)
      return res.status(404).json({ message: 'Consultation history not found' });
    return res.status(200).json({
      message: 'Consultation History  found',
      data: findConHx,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to Find Consultation History' });
  }
};
//return all consultation history records
export const fetchAllConHx = async (req, res) => {
  try {
    // Fetch all consultations with associated patient details (from the userId field)
    const findAllMedHx = await Consultation.findAll({
      include: [
        {
          model: User,
          as: "patient", // Use an alias for clarity
          attributes: ["id", "firstName", "lastName", "email", "phone", "gender", "age", "address"], // Fetch only relevant fields
        },
      ],
    });

    if (!findAllMedHx || findAllMedHx.length === 0) {
      return res.status(404).json({ message: "No consultation history found" });
    }

    return res.status(200).json({
      message: "Consultation history retrieved successfully",
      data: findAllMedHx,
    });

  } catch (error) {
    console.error("Error fetching consultation history:", error);
    return res.status(500).json({ message: "Unable to fetch consultation history", error: error.message });
  }
};

// controller for a single patient to view all consultations that belongs to him/her
export const fetchPatientConsultations = async (req, res) => {
  try {
    // ✅ Extract and validate patient ID
    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      return res.status(400).json({ message: "Invalid patient ID format" });
    }

    // ✅ Ensure the user exists and is a patient
    const patient = await User.findOne({
      where: { id, role: "patient" }, // Ensure role is patient
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found or not a valid patient" });
    }

    // ✅ Fetch all consultations for this patient
    const patientConsultations = await Consultation.findAll({
      where: { userId: id }, // Fetch consultations for this patient only
      include: [
        {
          model: User,
          as: "healthWorker",
          attributes: ["id", "firstName", "lastName", "email", "phone"], // Fetch only necessary fields
        },
      ],
      order: [["createdAt", "DESC"]], // Sort from newest to oldest
    });

    return res.status(200).json({
      message: "Consultation records retrieved successfully",
      data: patientConsultations || [], // ✅ Return an empty array if no consultations exist
    });
  } catch (error) {
    console.error("Fetch Patient Consultations Error:", error);
    return res.status(500).json({
      message: "Unable to fetch consultation records",
      error: error.message,
    });
  }
};

