import express from "express";
import { getOnePatient, updatePatient, getAllPatients } from "../../controllers/users/patientController.js";
import { authenticator } from "../../middleware/authenticationMiddleware.js";
const router = express.Router();

router.get("/patient-profile/:patientId", authenticator, getOnePatient);
router.put("/update-profile/:id", authenticator, updatePatient)
router.get("/patients", authenticator, getAllPatients);

export default router
