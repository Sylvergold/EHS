import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import BPReading from "./BPReading.js";
import Medication from "./medicationHx.js";
import Consultation from "./consultation.js";
import healthWorkerProfile from "./HealthWorkerProfile.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("patient", "health_worker", "admin"),
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM("male", "female"),
            allowNull: false,
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        phone: { type: DataTypes.STRING },
        address: { type: DataTypes.STRING },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

// Define relationships with proper aliasing

// Patients & Consultations (Each patient can have many consultations)
User.hasMany(Consultation, { foreignKey: "userId", as: "patientConsultations", onDelete: "CASCADE" });
Consultation.belongsTo(User, { foreignKey: "userId", as: "patient" });

// Health Workers & Consultations (Each health worker can have many consultations)
User.hasMany(Consultation, { foreignKey: "healthWorkerId", as: "doctorConsultations", onDelete: "CASCADE" });
Consultation.belongsTo(User, { foreignKey: "healthWorkerId", as: "healthWorker" });

// BP Readings (Each patient can have multiple BP readings)
User.hasMany(BPReading, { foreignKey: "patientId", as: "patientBPReadings", onDelete: "CASCADE" });
BPReading.belongsTo(User, { foreignKey: "patientId", as: "patient" });

// Medications (Each patient can have multiple medications)
User.hasMany(Medication, { foreignKey: "patientId", as: "patientMedications", onDelete: "CASCADE" });
Medication.belongsTo(User, { foreignKey: "patientId", as: "patient" });

// Add a one-to-one relationship (Each health worker has one professional profile)
User.hasOne(healthWorkerProfile, { foreignKey: "userId", as: "profile", onDelete: "CASCADE" });
healthWorkerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

export default User;