const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES) => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/typing-speed-battle';
    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        if (retries > 0) {
            console.warn(`⚠️  MongoDB connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            return connectDB(retries - 1);
        }
        console.error('❌ MongoDB connection failed after all retries:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
