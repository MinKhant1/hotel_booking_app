import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminMe } from '../controllers/adminAuthController.js';
import {
  listAdminRooms,
  createAdminRoom,
  updateAdminRoom,
  deleteAdminRoom,
} from '../controllers/adminRoomController.js';
import { listAdminBookings, deleteAdminBooking } from '../controllers/adminBookingController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/me', adminMe);
router.get('/bookings', listAdminBookings);
router.delete('/bookings/:id', deleteAdminBooking);
router.get('/rooms', listAdminRooms);
router.post('/rooms', createAdminRoom);
router.put('/rooms/:id', updateAdminRoom);
router.delete('/rooms/:id', deleteAdminRoom);

export default router;
