import { Router } from 'express';
import { listRooms, listAvailableRooms, june2025Meta } from '../controllers/roomController.js';

const router = Router();

router.get('/', listRooms);
router.get('/available', listAvailableRooms);
router.get('/meta/june-2025', june2025Meta);

export default router;
