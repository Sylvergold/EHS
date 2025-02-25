import healthWorkerProfileBioData from "../../models/users/User.js";
import healthWorkerProfile from "../../models/users/HealthWorkerProfile.js";
import User from "../../models/users/User.js";

export const createProfessionalProfile = async (req, res) => {
  try {
    // Check if req.user exists
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    // Fetch user from the database
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { role, Specialization, Qualifications, WorkExperience } = req.body;

    // Create an instance of the professional profile
    const healthWorkerProfessionalProfile = await healthWorkerProfile.create({
      role,
      Specialization,
      Qualifications,
      WorkExperience,
      userId: user.id, 
    });

    // Send a success response
    res.status(201).json({
      message: "Health worker professional profile created successfully",
      data: healthWorkerProfessionalProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateHealthWorkerProfessionalProfile = async (req, res) => {
  try {
    console.log("Request User:", req.user); // Debugging

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user found in request" });
    }

    const userId = req.user.id; // Extract user ID from authenticated user
    const { healthWorkerProfileId } = req.params;
    const { role, Specialization, Qualifications, WorkExperience } = req.body;

    // Validate User Existence
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate Profile Existence
    const healthWorkerProfessionalProfile = await healthWorkerProfile.findOne({
      where: { id: healthWorkerProfileId, userId },
    });

    if (!healthWorkerProfessionalProfile) {
      return res
        .status(404)
        .json({ message: "Health worker professional profile not found" });
    }

    // Ensure User Ownership
    if (String(healthWorkerProfessionalProfile.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    // Update Profile
    await healthWorkerProfessionalProfile.update({
      role: role || healthWorkerProfessionalProfile.role,
      Specialization:
        Specialization || healthWorkerProfessionalProfile.Specialization,
      Qualifications:
        Qualifications || healthWorkerProfessionalProfile.Qualifications,
      WorkExperience:
        WorkExperience || healthWorkerProfessionalProfile.WorkExperience,
    });

    res.status(200).json({
      message: "Health worker professional profile updated successfully",
      data: healthWorkerProfessionalProfile,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//Get one health worker bio data info
export const getOneProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the ID is a valid number (if using integer IDs)
    if (!id) {
      return res.status(400).json({ message: "Invalid health worker profile ID" });
    }

    // Fetch the profile with role validation
    const profile = await healthWorkerProfileBioData.findOne({
      where: {
        id: id, // Ensure correct column name
        role: "health_worker",
      },
    });

    if (!profile) {
      return res.status(404).json({
        message: "Health worker profile not found in the database",
      });
    }

    return res.status(200).json({
      message: "Health Worker Profile Biodata retrieved successfully",
      data: profile,
    });

  } catch (error) {
    console.error("Error fetching health worker profile:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the profile",
      error: error.message,
    });
  }
};

export const getOneHealthWorkerProfile = async (req, res) => {
  try {
    const { id: userId } = req.params; // Extract userId from URL params

    // Fetch the health worker profile based on the userId
    const profile = await healthWorkerProfile.findOne({
      where: { userId }, // Ensure we fetch the profile based on userId
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "role"],
          where: { role: "health_worker" }, // Ensure the user has the correct role
        },
      ],
    });

    if (!profile) {
      return res.status(404).json({
        message: `Health worker professional profile not found for this user.`,
      });
    }

    return res.status(200).json({
      message: `Health worker professional profile retrieved successfully.`,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching health worker profile:", error);
    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
      error: error.message,
    });
  }
};
