import express from 'express';
import { addBP, fetchBP,
  fetchAllBP,
  fetchAllBPForPatient, updateBP } from '../../controllers/users/BPReadingController.js';
import { validateBPMeasurement } from '../../middleware/validationMiddleware.js';
import { authenticator } from '../../middleware/authenticationMiddleware.js';
import { verifyCardNumberForBP } from '../../controllers/users/verifyCardNumberForBp.js';

const router = express.Router();

router.post('/bp', authenticator, validateBPMeasurement, addBP); // Any user (patient or health worker) can add BP, but only for patients
router.get('/bp', authenticator, fetchAllBP); // ✅ Fetch all BP readings (only for patients)
router.get('/bp/patient/:patientId', authenticator, fetchAllBPForPatient); // ✅ Fetch all BP readings of a specific patient
router.get('/bp/:id', authenticator, fetchBP); // ✅ Fetch a specific BP reading of a specific patient
router.put('/bp/update-bp/:id', authenticator, updateBP); // ✅ Fetch a specific BP reading of a specific patient
router.post('/bp/verify-card', authenticator, verifyCardNumberForBP)


export default router;
