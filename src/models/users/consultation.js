import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Consultation = sequelize.define(
    "Consultation",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        healthWorkerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users", // Use the imported User model
                key: "id",
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users", // Use the imported User model
                key: "id",
            },
        },
        consultationNotes: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        prescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        allergies: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sideEffects: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

export default Consultation;