import mongoose from 'mongoose';

const MentorshipRequestSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  message: String,
  area: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

MentorshipRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('MentorshipRequest', MentorshipRequestSchema);