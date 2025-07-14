const express = require('express');
const router = express.Router();
const {
  getShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} = require('../controller/showtimeController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public route
router.get('/', getShowtimes);

// Admin-only routes
router.post('/', protect, isAdmin, createShowtime);
router.put('/:id', protect, isAdmin, updateShowtime);
router.delete('/:id', protect, isAdmin, deleteShowtime);

module.exports = router;
