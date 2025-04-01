import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const CardNumbers = sequelize.define("CardNumbers", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM("unused", "used"),
    defaultValue: "unused",
  },
  assignedTo: {
  type: DataTypes.UUID, // ✅ Matches Users.id
  allowNull: true,
  references: {
    model: "users",
    key: "id",
  },
  onDelete: "SET NULL",
},
});

