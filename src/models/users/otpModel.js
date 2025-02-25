import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const OTP = sequelize.define("OTP", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default OTP;
