import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';

export async function listAdminRooms(_req, res) {
  try {
    const rooms = await Room.find().sort({ type: 1, roomId: 1 }).lean();
    return res.json(rooms);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to list rooms' });
  }
}

export async function createAdminRoom(req, res) {
  try {
    const { roomId, type, price } = req.body;
    if (!roomId || !type || price === undefined || price === null) {
      return res.status(400).json({ message: 'roomId, type, and price are required' });
    }
    const t = String(type).toLowerCase();
    if (t !== 'single' && t !== 'double') {
      return res.status(400).json({ message: 'type must be single or double' });
    }
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) {
      return res.status(400).json({ message: 'price must be a non-negative number' });
    }
    const rid = String(roomId).trim();
    const clash = await Room.findOne({ roomId: rid });
    if (clash) {
      return res.status(409).json({ message: 'A room with this roomId already exists' });
    }
    const room = await Room.create({ roomId: rid, type: t, price: p });
    return res.status(201).json(room);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to create room' });
  }
}

export async function updateAdminRoom(req, res) {
  try {
    const { id } = req.params;
    const { roomId, type, price } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (roomId !== undefined) {
      const rid = String(roomId).trim();
      if (rid !== room.roomId) {
        const clash = await Room.findOne({ roomId: rid, _id: { $ne: room._id } });
        if (clash) {
          return res.status(409).json({ message: 'Another room already uses this roomId' });
        }
        room.roomId = rid;
      }
    }

    if (type !== undefined) {
      const t = String(type).toLowerCase();
      if (t !== 'single' && t !== 'double') {
        return res.status(400).json({ message: 'type must be single or double' });
      }
      room.type = t;
    }

    if (price !== undefined && price !== null) {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0) {
        return res.status(400).json({ message: 'price must be a non-negative number' });
      }
      room.price = p;
    }

    await room.save();
    return res.json(room);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to update room' });
  }
}

export async function deleteAdminRoom(req, res) {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const bookingCount = await Booking.countDocuments({ roomId: room._id });
    if (bookingCount > 0) {
      return res.status(409).json({
        message: `Cannot delete room: ${bookingCount} booking(s) reference this room. Cancel bookings first.`,
      });
    }
    await room.deleteOne();
    return res.json({ message: 'Room deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to delete room' });
  }
}
