import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const BPReading = sequelize.define(
  "BPReading",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    systolic: { type: DataTypes.INTEGER, allowNull: false },
    diastolic: { type: DataTypes.INTEGER, allowNull: false },
    heartRate: { type: DataTypes.INTEGER, allowNull: false },
    measurementLocation: { type: DataTypes.STRING, allowNull: false },
    measuredBy: { type: DataTypes.STRING, allowNull: false }, // Who recorded it (patient or health worker)
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users", // Ensures patientId is linked to the Users table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "bpreadings", // Keeps table naming consistent
    timestamps: true, // Enables createdAt & updatedAt timestamps
  }
);

export default BPReading;
