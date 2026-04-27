import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { normalizeQueryDates, isJune2025Utc } from '../utils/dateUtils.js';

export async function listRooms(_req, res) {
  try {
    const rooms = await Room.find().sort({ type: 1, roomId: 1 }).lean();
    return res.json(rooms);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to list rooms' });
  }
}

/**
 * Rooms free on ALL requested dates (UTC YYYY-MM-DD, years 2000–2100).
 * Query: date=YYYY-MM-DD OR dates=comma-separated
 * type: single | double | omit for any
 */
export async function listAvailableRooms(req, res) {
  try {
    const requestedDates = normalizeQueryDates(req.query.date, req.query.dates);
    const type = req.query.type ? String(req.query.type).toLowerCase() : null;
    if (type && type !== 'single' && type !== 'double') {
      return res.status(400).json({ message: 'type must be single or double' });
    }

    const filter = type ? { type } : {};
    const rooms = await Room.find(filter).sort({ roomId: 1 }).lean();

    const conflicting = await Booking.find({
      dates: { $elemMatch: { $in: requestedDates } },
    })
      .select('roomId')
      .lean();

    const busyRoomIds = new Set(conflicting.map((b) => String(b.roomId)));
    const available = rooms.filter((room) => !busyRoomIds.has(String(room._id)));

    return res.json({
      dates: requestedDates.map((d) => d.toISOString().slice(0, 10)),
      rooms: available,
    });
  } catch (e) {
    const status = e.status || 500;
    if (status !== 500) {
      return res.status(status).json({ message: e.message });
    }
    console.error(e);
    return res.status(500).json({ message: 'Failed to list available rooms' });
  }
}

/** June 2025 day list for date pickers */
export async function june2025Meta(_req, res) {
  const days = [];
  for (let d = 1; d <= 30; d++) {
    const dt = new Date(Date.UTC(2025, 5, d, 12, 0, 0, 0));
    if (isJune2025Utc(dt)) {
      days.push(dt.toISOString().slice(0, 10));
    }
  }
  return res.json({ month: '2025-06', days });
}
