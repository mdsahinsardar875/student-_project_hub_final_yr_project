import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Session', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jti: { type: String, required: true, unique: true },
  userAgent: String, ip: String,
  lastActive: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
}, { timestamps: true }));
