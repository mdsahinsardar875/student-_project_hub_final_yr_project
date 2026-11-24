import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Announcement', new Schema({
  title: { type: String, required: true, maxlength: 150 },
  category: { type: String, default: 'General' },
  audience: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
  message: { type: String, required: true, maxlength: 4000 },
  status: { type: String, enum: ['draft', 'published', 'scheduled', 'archived'], default: 'published', index: true },
  publishAt: Date,
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }));
