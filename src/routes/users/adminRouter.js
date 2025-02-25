import express from "express";
import {allUser} from "../../controllers/users/adminController.js";
import { makeAdmin } from "../../controllers/users/adminController.js";
import { getAllHealthworkers } from "../../controllers/admin/healthworkers.js";
import {authenticator} from "../../middleware/authenticationMiddleware.js";

const adminRouter = express.Router();

adminRouter.put("/makeAdmin/:id", makeAdmin)
adminRouter.get("/users", allUser);
adminRouter.get("/all-health-workers", authenticator, getAllHealthworkers);

export default adminRouter