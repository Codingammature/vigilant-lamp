import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/chat
// @desc    RAG Chatbot using Gemini
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'AI Chatbot is not configured properly on the server (Missing API Key).' });
    }

    // Initialize the AI client here to ensure dotenv has already populated process.env
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Retrieval Step: Fetch User and latest 5 transactions
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await Transaction.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
    .populate('senderId', 'name phone')
    .populate('receiverId', 'name phone')
    .sort({ createdAt: -1 })
    .limit(5);

    // 2. Augmentation Step: Build Context
    const userContext = `User Details:\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nCurrent Wallet Balance: ₹${user.walletBalance}\n\n`;
    
    let transactionContext = 'Recent Transactions:\n';
    if (transactions.length === 0) {
        transactionContext += 'No recent transactions.\n';
    } else {
        transactions.forEach((tx, index) => {
            const isSender = tx.senderId && tx.senderId._id.toString() === req.user.id;
            const otherParty = isSender ? (tx.receiverId ? tx.receiverId.name : 'Unknown') : (tx.senderId ? tx.senderId.name : 'Unknown');
            const direction = tx.type === 'ADD_FUNDS' ? 'Added Funds' : (isSender ? `Sent to ${otherParty}` : `Received from ${otherParty}`);
            
            transactionContext += `${index + 1}. Amount: ₹${tx.amount} | Type: ${direction} | Status: ${tx.status} | Date: ${tx.createdAt}\n`;
        });
    }

    const systemPrompt = `You are an AI financial assistant for a PhonePe-like payment application.
You will answer the user's questions strictly based on the provided context of their profile and recent transactions. 
Maintain a helpful, professional, and concise tone. 

CONTEXT:
${userContext}
${transactionContext}

USER QUESTION:
${message}

ANSWER:`;

    // 3. Generation Step: Call Gemini Model
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI service. Please try again later.' });
  }
});

export default router;
