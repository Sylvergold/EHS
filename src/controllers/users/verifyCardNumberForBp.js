import User from "../../models/users/User.js";

// Verifying card number for BP
export const verifyCardNumberForBP = async (req, res) => {
  try {
    const { cardNumber } = req.body;

    if (!cardNumber) {
      return res.status(400).json({ message: "Card number is required." });
    }

    // Find the patient by card number
    const patient = await User.findOne({
      where: { cardNumber },
      attributes: ["id", "firstName", "lastName", "cardNumber"],
    });

    if (!patient) {
      return res.status(404).json({
        message: "Card number not found. Please check and try again.",
      });
    }

    return res.status(200).json({
      message: "Verification successful. You can proceed to add BP readings.",
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        cardNumber: patient.cardNumber,
      },
    });
  } catch (error) {
    console.error("Error verifying card number:", error);
    return res.status(500).json({
      message: "An error occurred while verifying the card number.",
      error: error.message || error,
    });
  }
};
