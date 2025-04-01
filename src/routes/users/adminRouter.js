import express from "express";
import {allUser} from "../../controllers/users/adminController.js";
import { makeAdmin } from "../../controllers/users/adminController.js";
import { getAllHealthworkers, getHealthworkerDetails, getPatientDetails } from "../../controllers/admin/healthworkers.js";
import {authenticator} from "../../middleware/authenticationMiddleware.js";

const adminRouter = express.Router();

adminRouter.put("/makeAdmin/:id", makeAdmin)
adminRouter.get("/users", allUser);
adminRouter.get("/all-health-workers", authenticator, getAllHealthworkers);
adminRouter.get("/healthworker-details/:healthWorkerId", authenticator, getHealthworkerDetails);
adminRouter.get("/patient-details/:patientId", authenticator, getPatientDetails);




export default adminRouter