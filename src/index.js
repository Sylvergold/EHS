import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/users/authRoutes.js';
import BPRoutes from './routes/users/BPReadingRoutes.js';
import ConsultRoutes from './routes/users/consultationRoute.js';
import MedicRoutes from './routes/users/medicationHxRoute.js';
import healthWorkerProfileRoutes from "./routes/users/healthWorkerProfileRoutes.js";
import patientRoutes from "./routes/users/patientRouter.js";
import adminRouter from "./routes/users/adminRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use("/api/auth", authRoutes);
app.use("/api/health-Worker", healthWorkerProfileRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/admin", adminRouter);
app.use('/api/patients', BPRoutes);
app.use('/api/healthworkers', ConsultRoutes);
app.use('/api/patients/', MedicRoutes);

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
