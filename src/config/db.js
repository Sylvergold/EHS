import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { generateCardNumbers } from "../utils/generateCardNumbers.js";
import { alterUsersTable } from "../utils/alterUsersTable.js";



dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Disable query logging in production

    dialectOptions: {
      supportBigNumbers: true,
      multipleStatements: true, // Allow multiple statements per query
    },

    pool: {
      max: 10, // Maximum number of connections in pool
      min: 0, // Minimum number of connections in pool
      acquire: 30000, // Wait 30 seconds before throwing error
      idle: 10000, // Close idle connections after 10 seconds
    },

    retry: {
      match: [
        /ER_NEED_REPREPARE/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      max: 3, // Retry failed queries up to 3 times before failing
    },
  }
);

const createOtpTable = async () => {
  try {
    await sequelize.query(`
            CREATE TABLE IF NOT EXISTS OTP (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otpCode VARCHAR(255) NOT NULL,
                expiresAt DATETIME NOT NULL
            )
        `);
    console.log("✅ OTP table created or already exists.");
  } catch (error) {
    console.error("❌ Error creating OTP table:", error);
  }
};

// const createCardNumbersTable = async () => {
//   try {
//     await sequelize.query(`
//     CREATE TABLE IF NOT EXISTS CardNumbers (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         cardNumber VARCHAR(255) NOT NULL UNIQUE,
//         status ENUM('unused', 'used') DEFAULT 'unused',
//         assignedTo CHAR(36) NULL, 
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
//     )
// `);

//     console.log("✅ CardNumbers table created or already exists.");
//   } catch (error) {
//     console.error("❌ Error creating CardNumbers table:", error);
//   }
// };

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    await sequelize.sync({ force: false }); // ⚠️ Use `{ force: true }` if you want to reset everything

    // Ensure the OTP table exists
    await createOtpTable();
    // await createCardNumbersTable();
    // Generate card numbers only if the table is empty
    await generateCardNumbers();
    // call alterUsersTable
    await alterUsersTable()

    console.log("✅ Database setup completed.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export { sequelize, connectDB };
