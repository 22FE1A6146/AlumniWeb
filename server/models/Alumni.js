import mongoose from 'mongoose';

const AlumniSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // This will match Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String },
  batch: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  degree: { type: String },
  major: { type: String },
  currentJobTitle: { type: String },
  company: { type: String },
  location: { type: String },
  bio: { type: String },
  linkedin: { type: String },
  twitter: { type: String },
  github: { type: String },
  website: { type: String },
  achievements: [{ type: String }],
  skills: [{ type: String }],
  experience: [{
    jobTitle: { type: String },
    company: { type: String },
    startDate: { type: String }, // Using String for simplicity (e.g., "2020-01")
    endDate: { type: String },   // Can be empty for current roles
    description: { type: String }
  }],
  isMentor: { type: Boolean, default: false },
  mentorshipAreas: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AlumniSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Alumni', AlumniSchema);