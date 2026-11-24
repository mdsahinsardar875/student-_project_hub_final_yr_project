import mongoose from 'mongoose';
const { Schema } = mongoose;
const review = new Schema({
  reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
  decision: { type: String, enum: ['approve', 'request_revision', 'needs_review'] },
  comment: String, at: { type: Date, default: Date.now },
}, { _id: false });
export default mongoose.model('Submission', new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1 },
  note: String,
  documents: [{ type: Schema.Types.ObjectId, ref: 'ProjectDocument' }],
  status: { type: String, enum: ['submitted', 'under_review', 'revision_requested', 'approved'], default: 'submitted', index: true },
  reviews: [review],
}, { timestamps: true }));
