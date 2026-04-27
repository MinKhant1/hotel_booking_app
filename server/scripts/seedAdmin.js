import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import { seedAdmin } from '../utils/seedAdmin.js';

async function main() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required. Copy server/.env.example to server/.env');
    process.exit(1);
  }
  await connectDB();
  const result = await seedAdmin();
  console.log(result.message);
  if (!result.ok) {
    process.exitCode = 1;
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
