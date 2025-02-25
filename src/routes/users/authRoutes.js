import express from "express";
import {
  register,
  login,
  updateUserBiodata,
} from "../../controllers/users/authController.js";
import { authenticator } from "./../../middleware/authenticationMiddleware.js";
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from "../../controllers/users/resetPasswordControllers.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// router.post("/send-reset-pwd-link", sendResetLink);
// router.put("/reset-password", resetPassword);
router.put("/update-biodata/:id", authenticator, updateUserBiodata);
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
