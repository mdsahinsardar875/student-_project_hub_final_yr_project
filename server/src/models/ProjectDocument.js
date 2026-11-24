import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('ProjectDocument', new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: String, size: Number,
  version: { type: Number, default: 1 },
  category: { type: String, default: 'other' },
}, { timestamps: true }));
