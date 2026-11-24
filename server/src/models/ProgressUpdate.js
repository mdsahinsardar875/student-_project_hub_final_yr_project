import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('ProgressUpdate', new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  percent: { type: Number, min: 0, max: 100, required: true },
  note: String,
  milestoneId: Schema.Types.ObjectId,
  milestoneStatus: String,
}, { timestamps: true }));
