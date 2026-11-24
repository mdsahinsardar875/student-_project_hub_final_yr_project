import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Ticket', new Schema({
  subject: { type: String, required: true, maxlength: 150 },
  category: { type: String, default: 'Other' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  description: { type: String, required: true, maxlength: 4000 },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  replies: [{ by: { type: Schema.Types.ObjectId, ref: 'User' }, text: String, at: { type: Date, default: Date.now }, _id: false }],
}, { timestamps: true }));
