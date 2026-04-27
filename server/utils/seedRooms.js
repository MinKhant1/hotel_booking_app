import { Room } from '../models/Room.js';

export async function seedRoomsIfEmpty() {
  const count = await Room.countDocuments();
  if (count > 0) return;

  const rooms = [];

  for (let i = 1; i <= 20; i++) {
    const id = `S-${String(i).padStart(2, '0')}`;
    rooms.push({ roomId: id, type: 'single', price: 89 });
  }
  for (let i = 1; i <= 10; i++) {
    const id = `D-${String(i).padStart(2, '0')}`;
    rooms.push({ roomId: id, type: 'double', price: 139 });
  }

  await Room.insertMany(rooms);
  console.log(`Seeded ${rooms.length} rooms (20 single, 10 double). Availability is derived from bookings.`);
}
