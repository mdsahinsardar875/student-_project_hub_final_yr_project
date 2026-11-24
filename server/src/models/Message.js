import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Message', new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true }));
