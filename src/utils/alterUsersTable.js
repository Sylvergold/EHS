import { sequelize } from "../config/db.js";
const alterUsersTable = async () => {
    try {
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN cardNumber VARCHAR(20) AFTER email;
        `);
        console.log("✅ cardNumber column added to Users table.");
    } catch (error) {
        if (error.original && error.original.code === "ER_DUP_FIELDNAME") {
            console.log("ℹ️ cardNumber column already exists in Users table.");
        } else {
            console.error("❌ Error altering Users table:", error);
        }
    }
};


export { alterUsersTable };
