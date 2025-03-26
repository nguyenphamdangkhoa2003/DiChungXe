import Trip from '../models/trip.model.js';
import { AppError } from '../utils/appError.js';

export const deleteTrip = async (tripId, userId, isAdmin = false) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (!isAdmin && !trip.driver_id.equals(userId)) {
    throw new AppError('Not authorized to delete this trip', 403);
  }

  const hasConfirmedPassengers = trip.passengers.some(p => p.status === 'confirmed');
  if (hasConfirmedPassengers && !isAdmin) {
    throw new AppError('Cannot delete trip with confirmed passengers', 400);
  }

  await trip.deleteOne();
  return { message: 'Trip deleted successfully' };
};