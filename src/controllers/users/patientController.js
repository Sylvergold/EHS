import User from "../../models/users/User.js";
import { sequelize } from "../../config/db.js";
export const getOnePatient = async (req, res) => {
    try {
        const { patientId } = req.params; // Ensure parameter name matches route

        // Validate userId
        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        // Find a user with role "patient" and matching ID
        const patient = await User.findOne({
            where: {
                id: patientId,
                role: "patient"
            }
        });

        // Check if the patient exists
        if (!patient) {
            return res.status(404).json({
                message: "Patient profile not found in the database"
            });
        }

        // Send response
        res.status(200).json({
            message: "Patient profile retrieved successfully",
            data: patient
        });

    } catch (error) {
        console.error("Get Patient Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


  // Update a user

export const updatePatient = async (req, res) => {
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
        try {
            const transaction = await sequelize.transaction();
            attempt++;

            const { id } = req.params;
            let { firstName, lastName, gender, age, phone, address } = req.body;

            if (req.body.role) {
                return res.status(403).json({ message: "You are not allowed to change the role" });
            }

            const updateData = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (gender) updateData.gender = gender;
            if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
            if (phone) updateData.phone = phone;
            if (address) updateData.address = address;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ message: "No valid fields provided for update" });
            }

            console.log("Updating patient with ID:", id);
            console.log("Update data:", updateData);

            const [rowsUpdated] = await User.update(updateData, {
                where: { id, role: "patient" },
                transaction,
                logging: console.log, // Enable Sequelize logging
            });

            if (rowsUpdated === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: "Patient biodata not found or can't be updated" });
            }

            await transaction.commit();

            const updatedPatient = await User.findByPk(id, {
                attributes: { exclude: ["password", "confirmPassword"] } // Exclude confirmPassword
            });

            return res.status(200).json({
                message: "Patient Biodata updated successfully",
                data: updatedPatient
            });

        } catch (error) {
            if (error.code === "ER_NEED_REPREPARE" && attempt < maxAttempts) {
                console.warn(`⚠️ Retrying update... Attempts left: ${maxAttempts - attempt}`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
                continue;
            }

            console.error("Update Patient Error:", error);
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }
};


// get all patients

export const getAllPatients = async (req, res) => {
  try {
    // Fetch all users where role is "patient"
    const patients = await User.findAll({
      where: { role: "patient" },
      attributes: ["id", "firstName", "lastName", "role", "gender", "dateOfBirth", "phone", "address"], // Select only necessary fields
    });

    // Calculate total patients based on the retrieved list
    const totalPatients = patients.length; 

    // Check if patients exist
    if (!patients.length) {
      return res.status(404).json({ message: "No patients found.", totalPatients: 0 });
    }

    // Return patients data and total count
    return res.status(200).json({ success: true, totalPatients, data: patients });

  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

