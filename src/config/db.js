import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        // Sync all models with the database (development only)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log("✅ Tables created or updated successfully.");
        } else {
            await sequelize.sync({ alter: false });
            console.log('✅ tables created or verified');
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
};

export { sequelize, connectDB };