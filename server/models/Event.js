import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  description: { type: String, required: true },
  media: {
    type: { type: String, enum: ['image', 'video'] },
    url: { type: String },
  },
  organizer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', eventSchema);