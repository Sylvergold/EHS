import express from "express";
import { createProfessionalProfile, updateHealthWorkerProfessionalProfile, getOneHealthWorkerProfile, getOneProfessionalProfile } from "../../controllers/users/healthWorkerProfileController.js";
import { authenticator } from "../../middleware/authenticationMiddleware.js";
//import { checkRoleStatus} from "../../middleware/checkRole.js"
import { generatePatientOTP } from "../../controllers/users/generatePatientOtp.js";
import { addBPByHealthWorker } from "../../controllers/users/addBpByHealthWorker.js";

const router = express.Router();

router.post("/create-Professional-Profile", authenticator, createProfessionalProfile);
router.post("/request-patient-otp", authenticator, generatePatientOTP);
router.post("/add-bp", authenticator, addBPByHealthWorker);
router.put("/update-Professional-Profile/:healthWorkerProfileId", authenticator, updateHealthWorkerProfessionalProfile);
router.get("/Profile/:id", authenticator, getOneProfessionalProfile)
router.get("/Professional-Profile/:id", authenticator, getOneHealthWorkerProfile)


export default router
