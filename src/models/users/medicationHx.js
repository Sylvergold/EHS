import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';

const Medication = sequelize.define('Medication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  healthWorkerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  medicationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Medication;
