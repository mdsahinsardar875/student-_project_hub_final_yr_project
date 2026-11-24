import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Evaluation', new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  evaluator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  criteria: [{ name: { type: String, required: true }, max: { type: Number, required: true, min: 0 }, obtained: { type: Number, required: true, min: 0 }, _id: false }],
  total: Number, maxTotal: Number, grade: String,
  result: { type: String, enum: ['pass', 'fail'] },
  remarks: String,
  published: { type: Boolean, default: false },
  publishedAt: Date,
  history: [{ at: Date, by: { type: Schema.Types.ObjectId, ref: 'User' }, total: Number, grade: String, _id: false }],
}, { timestamps: true }));
