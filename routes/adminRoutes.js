const express = require('express');
const router = express.Router();
const {
  promoteToAdmin,
  getAllReservations,
  getStats,
} = require('../controller/adminController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// 🛡️ All admin routes are protected
router.use(protect, isAdmin);

// 👑 Promote user to admin
router.put('/promote/:id', promoteToAdmin);

// 📋 View all reservations
router.get('/reservations', getAllReservations);

// 📊 Showtimes revenue & capacity stats
router.get('/stats', getStats);

module.exports = router;
