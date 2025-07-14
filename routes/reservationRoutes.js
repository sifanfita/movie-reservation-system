const express = require('express');
const router = express.Router();
const {
  getAvailableSeats,
  reserveSeats,
  getUserReservations,
  cancelReservation,
} = require('../controller/reservationController');

const { protect } = require('../middleware/authMiddleware');

// Get available seats for a showtime (public or protected? let's protect)
router.get('/showtimes/:showtimeId/seats', protect, getAvailableSeats);

// Reserve seats for a showtime (protected)
router.post('/showtimes/:showtimeId/reserve', protect, reserveSeats);

// Get user's reservations
router.get('/', protect, getUserReservations);

// Cancel a reservation by id
router.delete('/:id', protect, cancelReservation);

module.exports = router;
