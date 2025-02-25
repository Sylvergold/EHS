import { Router } from "express";
import {
  addConsultation,
  updateConsultation,
  fetchAllConHx,
  fetchConHx,
  fetchPatientConsultations,
} from "../../controllers/users/consultationController.js";
import { validateConsultation } from "../../middleware/validationMiddleware.js";
import { authenticator } from "./../../middleware/authenticationMiddleware.js";

const router = Router();

router.post(
  "/add-consultation",
  validateConsultation,
  authenticator,
  addConsultation
);
router.put(
  "/update-consultation/:id",
  validateConsultation,
  authenticator,
  updateConsultation
);
router.get("/consultations", authenticator, fetchAllConHx);
router.get("/consultations/:id", authenticator, fetchConHx);
router.get("/patient/consultations/:id", authenticator, fetchPatientConsultations);

export default router;
