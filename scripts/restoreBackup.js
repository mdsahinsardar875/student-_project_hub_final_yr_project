// Usage: node scripts/restoreBackup.js server/backups/<file>.json --confirm
// Replaces ALL data in the database with the snapshot. Stop the API first.
import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
const [file, flag] = process.argv.slice(2);
if (!file || flag !== '--confirm') { console.error('Usage: node scripts/restoreBackup.js <backup.json> --confirm  (this OVERWRITES the database)'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI);
const { collections } = mongoose.mongo.BSON.EJSON.parse(fs.readFileSync(file, 'utf8'));
for (const [name, docs] of Object.entries(collections)) { const c = mongoose.connection.db.collection(name); await c.deleteMany({}); if (docs.length) await c.insertMany(docs); console.log(`${name}: ${docs.length}`); }
await mongoose.disconnect();
