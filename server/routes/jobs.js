
import express from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    console.log('Fetched jobs from DB:', jobs.length);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's jobs
router.get('/my-jobs', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      console.error('No user UID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    console.log('Fetching jobs for user:', req.user.uid);
    const jobs = await Job.find({ postedBy: req.user.uid });
    res.json(jobs);
  } catch (error) {
    console.error('Error in GET /my-jobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid ObjectId:', req.params.id);
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Post a new job
router.post('/', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      console.error('Authentication failed: No user or UID found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { description, media } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const job = new Job({
      description,
      ...(media && media.type && media.url ? { media } : {}),
      createdAt: new Date(),
      postedBy: req.user.uid,
    });

    const newJob = await job.save();
    console.log('Created new job:', newJob._id);
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a job
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      console.error('Authentication failed: No user or UID found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid ObjectId:', req.params.id);
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy !== req.user.uid) {
      console.error('Unauthorized update attempt by user:', req.user.uid);
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const { description, media } = req.body;

    if (!description && (!media || !media.type || !media.url)) {
      return res.status(400).json({ message: 'At least one field (description or media) must be provided' });
    }

    if (description) {
      job.description = description;
    }

    if (media && media.type && media.url) {
      job.media = media;
    } else if (media && media.type === null && media.url === null) {
      job.media = undefined; // Allow clearing media
    }

    

    const updatedJob = await job.save();
    console.log('Updated job:', updatedJob._id);
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      console.error('Authentication failed: No user or UID found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid ObjectId:', req.params.id);
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy !== req.user.uid) {
      console.error('Unauthorized delete attempt by user:', req.user.uid);
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    console.log('Deleted job:', req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;


