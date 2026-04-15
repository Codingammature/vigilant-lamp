import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/transactions/add-funds
// @desc    Add money to wallet
router.post('/add-funds', protect, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += Number(amount);
    await user.save();

    const transaction = await Transaction.create({
      receiverId: user._id,
      amount,
      type: 'ADD_FUNDS',
      paymentMethod: paymentMethod || 'WALLET',
      status: 'SUCCESS'
    });

    res.json({ message: 'Funds added successfully', balance: user.walletBalance, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/transfer
// @desc    Transfer money to another user (with ML verification)
router.post('/transfer', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverPhone, amount, paymentMethod } = req.body;
    const senderId = req.user.id;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Transfer amount must be positive' });
    }

    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findOne({ 
      $or: [{ phone: receiverPhone }, { email: receiverPhone }] 
    }).session(session);

    if (!receiver) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (sender._id.toString() === receiver._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    if (sender.walletBalance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Complete Transaction
    sender.walletBalance -= Number(amount);
    receiver.walletBalance += Number(amount);

    await sender.save({ session });
    await receiver.save({ session });

    const transaction = new Transaction({
      senderId: sender._id,
      receiverId: receiver._id,
      amount,
      type: 'TRANSFER',
      paymentMethod: paymentMethod || 'WALLET',
      status: 'SUCCESS'
    });
    
    await transaction.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Transfer successful', transaction });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ message: 'Server error during transfer' });
  } finally {
    session.endSession();
  }
});

// @route   GET /api/transactions/history
// @desc    Get user's transactions
router.get('/history', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
    .populate('senderId', 'name phone')
    .populate('receiverId', 'name phone')
    .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
