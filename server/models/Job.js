
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video'],
    },
    url: {
      type: String,
    },
  },
  createdAt: { type: Date, default: Date.now },



  postedBy: {
    type: String,
    required: true,


  },


  // Added for edit tracking




});

export default mongoose.model('Job', JobSchema);
