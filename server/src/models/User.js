import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true, index: true },
  rollNumber: { type: String, trim: true, index: true },
  employeeId: { type: String, trim: true },
  department: { type: String, trim: true },
  phone: String,
  active: { type: Boolean, default: true },
  resetTokenHash: { type: String, select: false },
  resetExpires: { type: Date, select: false },
}, { timestamps: true });
userSchema.methods.toSafe = function () {
  const { _id, name, email, role, rollNumber, employeeId, department, phone, active } = this;
  return { id: _id, name, email, role, rollNumber, employeeId, department, phone, active };
};
export default mongoose.model('User', userSchema);
