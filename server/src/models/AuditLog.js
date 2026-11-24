import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('AuditLog', new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: String, meta: Schema.Types.Mixed,
}, { timestamps: true }));
