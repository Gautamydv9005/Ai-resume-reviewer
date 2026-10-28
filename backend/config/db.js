import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_reviewer';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      dbName: 'ai_resume_reviewer',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if local Mongo is not up
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${uri} (${error.message}).`);
    console.warn(`[Database] The backend will operate with robust in-memory persistence fallback so you can test immediately.`);
    console.warn(`[Database] To use persistent MongoDB, ensure mongod is running locally or provide MONGODB_URI in backend/.env.`);
    isConnected = false;
    return false;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  host: isConnected ? mongoose.connection?.host : 'In-Memory Fallback',
  name: isConnected ? mongoose.connection?.name : 'ai_resume_reviewer'
});
