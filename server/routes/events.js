import express from 'express';
import Event from '../models/Event.js';
import { verifyToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * @route GET /api/events
 * @desc Get all events
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

/**
 * @route GET /api/events/:id
 * @desc Get event by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

/**
 * @route POST /api/events
 * @desc Create a new event
 * @access Protected (Authenticated users)
 */
router.post(
  '/',
  verifyToken,
  [
    body('description')
      .isString()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),
    body('media')
      .optional()
      .isObject()
      .withMessage('Media must be an object'),
    body('media.type')
      .optional()
      .isIn(['image', 'video'])
      .withMessage('Media type must be either "image" or "video"'),
    body('media.url')
      .optional()
      .isURL()
      .withMessage('Media URL must be a valid URL'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { description, media } = req.body;

      // Create new event
      const event = new Event({
        description,
        ...(media && media.type && media.url ? { media } : {}),
        organizer: req.user.uid,
        createdAt: new Date(),
      });

      const newEvent = await event.save();
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(400).json({ message: 'Failed to create event' });
    }
  }
);

/**
 * @route DELETE /api/events/:id
 * @desc Delete an event
 * @access Protected (Event organizer only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer !== req.user.uid) {
      return res.status(403).json({
        message: 'Unauthorized: Only the event organizer can delete this event',
      });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
});

export default router;