import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { seedMongoIfEmpty } from './dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const run = async () => {
  console.log('[Seed] Connecting to MongoDB to seed initial records...');
  await connectDB();
  await seedMongoIfEmpty();
  console.log('[Seed] Seeding finished successfully.');
  process.exit(0);
};

run();
