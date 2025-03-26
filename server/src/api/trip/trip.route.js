import express from 'express';
import * as tripController from './trip.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();
// Public routes
router.get('/search', tripController.searchTrips);
router.get('/:id', tripController.getTrip);

// Protected routes
router.use(protect);

// Driver routes
router
    .route('/')
    .post(restrictTo('driver', 'admin'), tripController.createTrip);
router
    .route('/:id')
    .patch(restrictTo('driver', 'admin'), tripController.updateTrip)
    .delete(restrictTo('driver', 'admin'), tripController.deleteTrip);
router.get(
    '/driver/my-trips',
    restrictTo('driver', 'admin'),
    tripController.getDriverTrips
);

// Passenger routes
router.post(
    '/:id/passengers',
    restrictTo('passenger', 'admin'),
    tripController.addPassenger
);
router.delete(
    '/:id/passengers',
    restrictTo('passenger', 'admin'),
    tripController.cancelPassenger
);
router.get(
    '/passenger/my-trips',
    restrictTo('passenger', 'admin'),
    tripController.getPassengerTrips
);

// Common routes
router.get('/my-trips', tripController.getMyTrips);

export default router;
