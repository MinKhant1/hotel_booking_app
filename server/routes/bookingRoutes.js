import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createBooking, listUserBookings, deleteBooking } from '../controllers/bookingController.js';

const router = Router();

router.use(requireAuth);

router.post('/', createBooking);
router.get('/user', listUserBookings);
router.delete('/:id', deleteBooking);

export default router;
