import User from "../../models/users/User.js";

export const getAllHealthworkers = async (req, res) => {
  try {
    // Fetch all users where role is "patient"
    const healthWorkers = await User.findAll({
      where: { role: "health_worker" },
      attributes: ["id", "firstName", "lastName", "role", "gender", "age", "phone", "address"], // Select only necessary fields
    });

    // Calculate total patients based on the retrieved list
    const totalHealthworkers = healthWorkers.length; 

    // Check if patients exist
    if (!healthWorkers.length) {
      return res.status(404).json({ message: "No patients found.", totalHealthworkers: 0 });
    }

    // Return patients data and total count
    return res.status(200).json({ success: true, totalHealthworkers, data: healthWorkers });

  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
