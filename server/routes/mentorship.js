import express from 'express';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Alumni from '../models/Alumni.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/mentors', async (req, res) => {
  try {
    const mentors = await Alumni.find({ isMentor: true });
    console.log('Fetched mentors count:', mentors.length); // Debugging log
    res.json({ status: 'success', data: mentors });
  } catch (error) {
    console.error('Error fetching mentors:', error); // Debugging log
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mentors',
      code: 'FETCH_MENTORS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/request', verifyToken, async (req, res) => {
  try {
    const { mentorId, area, message } = req.body;
    if (!mentorId || !area) {
      return res.status(400).json({
        status: 'error',
        message: 'Mentor ID and area are required',
        code: 'MISSING_FIELDS'
      });
    }
    const mentor = await Alumni.findOne({ userId: mentorId, isMentor: true });
    if (!mentor) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentor not found',
        code: 'MENTOR_NOT_FOUND'
      });
    }
    const existingRequest = await MentorshipRequest.findOne({
      mentorId: mentor._id,
      studentId: req.user.uid,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existingRequest) {
      return res.status(400).json({
        status: 'error',
        message: existingRequest.status === 'pending' ? 'Pending request exists' : 'Already mentored',
        code: 'REQUEST_EXISTS'
      });
    }
    const mentorshipRequest = new MentorshipRequest({
      mentorId: mentor._id,
      studentId: req.user.uid,
      area,
      message
    });
    const newRequest = await mentorshipRequest.save();
    res.status(201).json({ status: 'success', data: newRequest });
  } catch (error) {
    console.error('Error creating mentorship request:', error); // Debugging log
    res.status(400).json({
      status: 'error',
      message: 'Failed to create mentorship request',
      code: 'CREATE_REQUEST_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/requests/mentor', verifyToken, async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ mentorId: req.user.uid });
    res.json({ status: 'success', data: requests });
  } catch (error) {
    console.error('Error fetching mentor requests:', error); // Debugging log
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mentor requests',
      code: 'FETCH_REQUESTS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/requests/student', verifyToken, async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user.uid });
    res.json({ status: 'success', data: requests });
  } catch (error) {
    console.error('Error fetching student requests:', error); // Debugging log
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student requests',
      code: 'FETCH_REQUESTS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/requests/:requestId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
        code: 'INVALID_STATUS'
      });
    }
    const request = await MentorshipRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }
    if (request.mentorId.toString() !== req.user.uid) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only mentor can update',
        code: 'UNAUTHORIZED_UPDATE'
      });
    }
    request.status = status;
    const updatedRequest = await request.save();
    res.json({ status: 'success', data: updatedRequest });
  } catch (error) {
    console.error('Error updating mentorship request:', error); // Debugging log
    res.status(400).json({
      status: 'error',
      message: 'Failed to update request',
      code: 'UPDATE_REQUEST_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;