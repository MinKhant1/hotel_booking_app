import { Booking } from '../models/Booking.js';

export async function listAdminBookings(_req, res) {
  try {
    const list = await Booking.find()
      .populate('userId', 'username email')
      .populate('roomId', 'roomId type price')
      .sort({ createdAt: -1 })
      .lean();

    const shaped = list.map((b) => ({
      _id: b._id,
      createdAt: b.createdAt,
      dates: b.dates.map((d) => new Date(d).toISOString().slice(0, 10)),
      user: b.userId,
      room: b.roomId,
    }));

    return res.json(shaped);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to list bookings' });
  }
}

export async function deleteAdminBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    await booking.deleteOne();
    return res.json({ message: 'Booking removed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to remove booking' });
  }
}
