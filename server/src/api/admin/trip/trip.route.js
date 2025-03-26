import express from 'express';
import * as tripController from './trip.controller.js';
import { protect, restrictTo } from '../../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.use(restrictTo('admin'));
router.delete('/admin/:id', tripController.adminDeleteTrip);
export default router;
