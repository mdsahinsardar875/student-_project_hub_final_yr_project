import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('Notification', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, default: 'system' }, // project | submission | review | evaluation | announcement | task | ticket | system
  title: { type: String, required: true }, message: String, link: String,
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true }));
