import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Task', new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, maxlength: 150 },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  deadline: Date,
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }));
