import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['single', 'double'], required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Room = mongoose.model('Room', roomSchema);
