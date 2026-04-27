import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    dates: [{ type: Date, required: true }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

bookingSchema.index({ roomId: 1, dates: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
