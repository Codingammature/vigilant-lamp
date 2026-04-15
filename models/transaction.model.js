import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for Add Funds
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for Add Funds
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['TRANSFER', 'ADD_FUNDS'],
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'WALLET'  
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
