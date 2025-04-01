import { sequelize } from "../config/db.js";
import crypto from "crypto";

const generateSecureCardNumber = () => {
    const randomString = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 characters (hex)
    return `OHF-${randomString}`;
};

const generateCardNumbers = async (count = 500) => {
    try {
        // Check if the CardNumbers table is empty
        const [results] = await sequelize.query(`SELECT COUNT(*) AS count FROM CardNumbers`);
        const recordCount = results[0].count;

        if (recordCount > 0) {
            console.log("✅ CardNumbers table already has records. Skipping generation.");
            return;
        }

        const cardNumbers = new Set();
        while (cardNumbers.size < count) {
            cardNumbers.add(generateSecureCardNumber());
        }

        const values = Array.from(cardNumbers).map(num => `('${num}', 'unused')`).join(", ");

        await sequelize.query(`
            INSERT INTO CardNumbers (cardNumber, status)
            VALUES ${values}
        `);

        console.log(`✅ Successfully generated and stored ${count} secure card numbers.`);
    } catch (error) {
        console.error("❌ Error generating card numbers:", error);
    }
};

export { generateCardNumbers };
