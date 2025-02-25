import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/users/User.js";
import dotenv from "dotenv";
// import nodemailer from "nodemailer";
import { sequelize } from "../../config/db.js";

dotenv.config();

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      gender,
      dateOfBirth,
      phone,
      address,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      gender,
      dateOfBirth,
      phone,
      address,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};


// UPDATE controller

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};

// export const sendResetLink = async (req, res) => {
//   try {
//     let resetLink, mailStatus;
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_ADDRESS,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//     const { email } = req.body;
//     //validation required
//     if (!email) {
//       return res.status(400).json({ message: "Invalid email" });
//     }
//     const findUser = await User.findOne({ where: { email } });
//     if (!findUser) {
//       return res.status(404).json({ message: "Email does not exist" });
//     }
//     //send mail
//     resetLink = `https://healthrecordsystembackend.onrender.com/api/auth/reset-password?id=${findUser.id}`;
//     mailStatus = await transporter.sendMail({
//       from: process.env.EMAIL_ADDRESS,
//       to: email,
//       subject: "reset password",
//       text: `Click the following link to reset  password ${resetLink}`,
//     });
//     return res.status(200).json({ message: "reset link sent successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ message: "Failed to send email" });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     //validation required
//     const { id } = req.query;
//     const { password } = req.body;
//     if (!password || !id) {
//       return res.status(400).json({ message: "Password and ID required" });
//     }
//     const hashPassword = await bcrypt.hash(password, 10);
//     await User.update({ password: hashPassword }, { where: { id } });
//     return res.status(200).json({ message: "Password Updated!" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Failed to reset password" });
//   }
// };


export const updateUserBiodata = async (req, res) => {
  try {
    const { id } = req.params;
    let { firstName, lastName, phone, address, email, dateOfBirth, role } = req.body;

    // Prevent role update
    if (role) {
      return res.status(400).json({ message: "You are not allowed to update the role." });
    }

    // Fetch current user details
    const [existingUser] = await sequelize.query(
      `SELECT id, email FROM users WHERE id=?`,
      { replacements: [id], type: sequelize.QueryTypes.SELECT }
    );

    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the email is being updated, check for uniqueness
    if (email && email !== existingUser.email) {
      const [emailExists] = await sequelize.query(
        `SELECT id FROM users WHERE email=? AND id<>?`,
        { replacements: [email, id], type: sequelize.QueryTypes.SELECT }
      );

      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another account." });
      }
    }

    // Build update fields dynamically
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
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    // Add updatedAt timestamp and ID to replacements
    updateFields.push("updatedAt=NOW()");
    replacements.push(id);

    // Execute update query
    const [results] = await sequelize.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id=?`,
      {
        replacements,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    if (results === 0) {
      return res.status(400).json({ message: "No changes were made. Try updating different values." });
    }

    // Retrieve updated user data
    const [updatedUser] = await sequelize.query(
      `SELECT id, firstName, lastName, email, phone, address, role, dateOfBirth FROM users WHERE id=?`,
      { replacements: [id], type: sequelize.QueryTypes.SELECT }
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


