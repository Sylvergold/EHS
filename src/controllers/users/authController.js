import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/users/User.js";
import dotenv from "dotenv";
import { sequelize } from "../../config/db.js";
import { CardNumbers } from "../../models/users/cardNumbers.js";
import sendEmail from "../../utils/sendEmail.js";

dotenv.config();

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      gender,
      dateOfBirth,
      phone,
      address,
      cardNumber,
    } = req.body;

    if (!(email && password) && !cardNumber) {
      return res.status(400).json({
        message: "Either email & password or a valid card number is required.",
      });
    }

    if (email) {
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    let assignedCard = null;

    if (cardNumber) {
      assignedCard = await CardNumbers.findOne({
        where: { cardNumber, status: "unused" },
      });

      if (!assignedCard) {
        return res
          .status(400)
          .json({ message: "Invalid or already used card number" });
      }
    } else if (role === "patient") {
      assignedCard = await CardNumbers.findOne({ where: { status: "unused" } });

      if (!assignedCard) {
        return res.status(400).json({
          message: "No available card numbers. Please generate more.",
        });
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await User.create({
      firstName,
      lastName,
      email: email || null,
      password: hashedPassword,
      role,
      gender,
      dateOfBirth,
      phone,
      address,
      cardNumber: assignedCard ? assignedCard.cardNumber : null,
    });

    if (assignedCard) {
      await assignedCard.update({ status: "used", assignedTo: user.id });
    }

    const currentYear = new Date().getFullYear();

    // Construct Email Content
   const emailContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Welcome to The OHF Health Record App</h2>
    <p style="font-size: 16px; color: #555;"><b>Dear ${firstName} ${lastName},</b></p>
    <p style="font-size: 16px; color: #555;">Your registration was successful! Here are your details:</p>
    <ul style="font-size: 16px; color: #555; padding-left: 20px;">
      <li><strong>Role:</strong> ${role}</li>
      <li><strong>Gender:</strong> ${gender}</li>
      <li><strong>Date of Birth:</strong> ${dateOfBirth}</li>
      <li><strong>Phone:</strong> ${phone}</li>
      <li><strong>Address:</strong> ${address}</li>
      ${
        user.cardNumber
          ? `<li><strong>Card Number:</strong> ${user.cardNumber}</li>`
          : ""
      }
    </ul>
    <p style="font-size: 14px; color: #777;">Thank you for registering with us!</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${currentYear} The Ogeri Health Foundation. All rights reserved.</p>
  </div>
`;

    // Send confirmation email
    if (email) {
      await sendEmail(email, "Registration Successful", emailContent);
    }

    res.status(201).json({
      message:
        "User registered successfully. A confirmation email has been sent.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        address: user.address,
        cardNumber: user.cardNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password, cardNumber } = req.body;

    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
    } else if (cardNumber) {
      user = await User.findOne({ where: { cardNumber } });
      if (!user) {
        return res.status(400).json({ message: "Invalid card number" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Email & password or card number is required" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const updateUserBiodata = async (req, res) => {
  try {
    const { email, cardNumber } = req.body;
    let {
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      role,
      cardNumber: newCardNumber,
    } = req.body;

    // Prevent role update
    if (role) {
      return res
        .status(400)
        .json({ message: "You are not allowed to update the role." });
    }

    // Prevent updating cardNumber
    if (newCardNumber) {
      return res
        .status(400)
        .json({ message: "Card number cannot be updated." });
    }

    // Find user by either email or cardNumber
    const [existingUser] = await sequelize.query(
      `SELECT id, email, cardNumber FROM users WHERE email=? OR cardNumber=?`,
      {
        replacements: [email || null, cardNumber || null],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found. Please check email or card number.",
      });
    }

    // If updating email, ensure it's unique
    if (email && email !== existingUser.email) {
      const [emailExists] = await sequelize.query(
        `SELECT id FROM users WHERE email=? AND id<>?`,
        {
          replacements: [email, existingUser.id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Email is already in use by another account." });
      }
    }

    // Dynamically build update fields
    let updateFields = [];
    let replacements = [];

    if (firstName) {
      updateFields.push("firstName=?");
      replacements.push(firstName);
    }
    if (lastName) {
      updateFields.push("lastName=?");
      replacements.push(lastName);
    }
    if (phone) {
      updateFields.push("phone=?");
      replacements.push(phone);
    }
    if (address) {
      updateFields.push("address=?");
      replacements.push(address);
    }
    if (email) {
      updateFields.push("email=?");
      replacements.push(email);
    }
    if (dateOfBirth) {
      updateFields.push("dateOfBirth=?");
      replacements.push(dateOfBirth);
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    // Add updatedAt timestamp and ID to replacements
    updateFields.push("updatedAt=NOW()");
    replacements.push(existingUser.id);

    // Execute update query
    const [results] = await sequelize.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id=?`,
      {
        replacements,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    if (results === 0) {
      return res.status(400).json({
        message: "No changes were made. Try updating different values.",
      });
    }

    // Retrieve updated user data
    const [updatedUser] = await sequelize.query(
      `SELECT id, firstName, lastName, email, phone, address, role, dateOfBirth, cardNumber FROM users WHERE id=?`,
      { replacements: [existingUser.id], type: sequelize.QueryTypes.SELECT }
    );

    return res.status(200).json({
      message: "User biodata updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user biodata:", error);
    return res.status(500).json({
      message: "An error occurred while updating user biodata.",
      error: error.message || error,
    });
  }
};
