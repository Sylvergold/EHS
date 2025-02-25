import {DataTypes} from "sequelize";
import {sequelize} from "../../config/db.js";

const healthWorkerProfile = sequelize.define("healthWorkerProfile", {
    userId: { 
        type: DataTypes.UUID, 
        allowNull: false },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Specialization: { 
        type: DataTypes.STRING,
        allowNull: false 
    },
    Qualifications: { 
        type: DataTypes.STRING,
        allowNull: false 
    },
    WorkExperience: { 
        type: DataTypes.TEXT,
        allowNull: false 
    }
  });
  
  export default healthWorkerProfile
