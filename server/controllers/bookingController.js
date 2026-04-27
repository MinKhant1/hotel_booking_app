import { Booking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { assertValidDates } from '../utils/dateUtils.js';

export async function createBooking(req, res) {
  try {
    const { roomId, dates } = req.body;
    if (!roomId || !dates) {
      return res.status(400).json({ message: 'roomId and dates are required' });
    }

    const normalizedDates = assertValidDates(Array.isArray(dates) ? dates : [dates]);

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const conflict = await Booking.findOne({
      roomId: room._id,
      dates: { $elemMatch: { $in: normalizedDates } },
    });

    if (conflict) {
      return res.status(409).json({
        message: 'This room is already booked for one or more of the selected dates',
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      roomId: room._id,
      dates: normalizedDates,
    });

    const populated = await Booking.findById(booking._id)
      .populate('roomId', 'roomId type price')
      .populate('userId', 'username email')
      .lean();

    return res.status(201).json(populated);
  } catch (e) {
    const status = e.status || 500;
    if (status !== 500) {
      return res.status(status).json({ message: e.message });
    }
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Duplicate booking' });
    }
    console.error(e);
    return res.status(500).json({ message: 'Failed to create booking' });
  }
}

export async function listUserBookings(req, res) {
  try {
    const list = await Booking.find({ userId: req.user._id })
      .populate('roomId', 'roomId type price')
      .sort({ createdAt: -1 })
      .lean();

    const shaped = list.map((b) => ({
      _id: b._id,
      createdAt: b.createdAt,
      dates: b.dates.map((d) => new Date(d).toISOString().slice(0, 10)),
      room: b.roomId,
    }));

    return res.json(shaped);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to load bookings' });
  }
}

export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    await booking.deleteOne();
    return res.json({ message: 'Booking cancelled' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to cancel booking' });
  }
}
