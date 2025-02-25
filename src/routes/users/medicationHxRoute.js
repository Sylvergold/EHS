import { Router } from 'express';
import {
  addMedication,
  fetchMedHx,
  fetchAllMedHx,
  // fetchAllUserMedHx,
} from '../../controllers/users/medicationHxControllers.js';

const router = Router();

router.post('/medications', addMedication);
router.get('/medications/all-medications', fetchAllMedHx);
router.get('/medications/:id', fetchMedHx);
export default router;
