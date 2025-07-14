const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controller/movieController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Admin-only routes
router.post('/', protect, isAdmin, createMovie);
router.put('/:id', protect, isAdmin, updateMovie);
router.delete('/:id', protect, isAdmin, deleteMovie);

module.exports = router;
