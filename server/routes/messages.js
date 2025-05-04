import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.uid
    }).sort({ updatedAt: -1 });
    res.json({ status: 'success', data: conversations });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations',
      code: 'FETCH_CONVERSATIONS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:conversationId', verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Not a participant',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ timestamp: 1 });
    await Message.updateMany(
      { conversationId: req.params.conversationId, recipient: req.user.uid, read: false },
      { read: true }
    );
    res.json({ status: 'success', data: messages });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch messages',
      code: 'FETCH_MESSAGES_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/:conversationId', verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Not a participant',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }
    if (!req.body.content) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required',
        code: 'MISSING_CONTENT'
      });
    }
    const recipient = conversation.participants.find(p => p.toString() !== req.user.uid);
    const message = new Message({
      conversationId: req.params.conversationId,
      sender: req.user.uid,
      recipient,
      content: req.body.content
    });
    const newMessage = await message.save();
    await Conversation.findByIdAndUpdate(req.params.conversationId, { updatedAt: Date.now() });
    res.status(201).json({ status: 'success', data: newMessage });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to send message',
      code: 'SEND_MESSAGE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/new', verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient ID required',
        code: 'MISSING_RECIPIENT'
      });
    }
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.uid, recipientId] }
    });
    if (existingConversation) {
      return res.json({
        status: 'success',
        data: { conversationId: existingConversation._id },
        message: 'Conversation exists'
      });
    }
    const conversation = new Conversation({
      participants: [req.user.uid, recipientId]
    });
    const newConversation = await conversation.save();
    res.status(201).json({ status: 'success', data: newConversation });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create conversation',
      code: 'CREATE_CONVERSATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;