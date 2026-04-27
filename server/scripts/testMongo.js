import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in server/.env');
  process.exit(1);
}

try {
  await mongoose.connect(uri);
  const ping = await mongoose.connection.db.admin().command({ ping: 1 });
  console.log('MongoDB: connected');
  console.log('  Host(s):', mongoose.connection.host);
  console.log('  Database:', mongoose.connection.name);
  console.log('  Ping:', ping.ok === 1 ? 'ok' : ping);
  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
  process.exit(0);
} catch (err) {
  console.error('MongoDB: FAILED');
  console.error(err.message || err);
  process.exit(1);
}
