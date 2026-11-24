// One-time admin initialisation. Reads credentials from env; nothing is hardcoded.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from '../server/node_modules/mongoose/index.js';
import User from '../server/src/models/User.js';
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10 || !MONGODB_URI) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars) in server/.env first.'); process.exit(1);
}
await mongoose.connect(MONGODB_URI);
if (await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })) { console.log('Admin already exists.'); }
else { await User.create({ name: ADMIN_NAME || 'Administrator', email: ADMIN_EMAIL, role: 'admin', passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) }); console.log('Admin created.'); }
await mongoose.disconnect();
