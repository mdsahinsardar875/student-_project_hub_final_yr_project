import mongoose from 'mongoose';
const { Schema } = mongoose;
export const PROJECT_STATUS = ['draft', 'in_progress', 'submitted', 'under_review', 'needs_revision', 'approved', 'completed', 'archived'];
const milestone = new Schema({
  title: { type: String, required: true }, description: String, dueDate: Date,
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
});
const member = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'Member' }, responsibility: String,
}, { _id: false });
const projectSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 800 },
  department: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['academic', 'research'], default: 'academic' },
  teamSize: Number,
  expectedSubmissionDate: Date,
  status: { type: String, enum: PROJECT_STATUS, default: 'in_progress', index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  team: [member],
  milestones: [milestone],
}, { timestamps: true });
export default mongoose.model('Project', projectSchema);
