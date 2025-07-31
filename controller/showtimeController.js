const pool = require('../config/dbConnection');
const asyncHandler = require('express-async-handler');

// Get all showtimes for a movie or all showtimes optionally filtered by date
const getShowtimes = asyncHandler(async (req, res) => {
  const { movieId, date } = req.query;

  let query = `
    SELECT showtimes.*, movies.title 
    FROM showtimes
    JOIN movies ON showtimes.movie_id = movies.id
  `;

  const conditions = [];
  const values = [];

  if (movieId) {
    values.push(movieId);
    conditions.push(`movie_id = $${values.length}`);
  }

  if (date) {
    values.push(date);
    conditions.push(`DATE(start_time) = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY start_time';

  
    const result = await pool.query(query, values);
    res.json(result.rows);
  
});

// Create a showtime (admin only)
const createShowtime = asyncHandler(async (req, res) => {
  const { movie_id, start_time, end_time, screen_number, capacity, ticket_price } = req.body;

  // Validate required fields
  if (!movie_id || !start_time || !end_time || !screen_number || !capacity || !ticket_price) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  
    // Check for scheduling conflict
    const conflictCheck = await pool.query(
      `SELECT * FROM showtimes 
       WHERE screen_number = $1
       AND ($2::timestamp, $3::timestamp) OVERLAPS (start_time, end_time)`,
      [screen_number, start_time, end_time]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Screen is already booked during this time range' });
    }

    // Insert the new showtime
    const result = await pool.query(
      `INSERT INTO showtimes (movie_id, start_time, end_time, screen_number, capacity, ticket_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [movie_id, start_time, end_time, screen_number, capacity, ticket_price]
    );

    const showtime = result.rows[0];

    // Auto-generate seats for the showtime
    for (let i = 1; i <= capacity; i++) {
      await pool.query(
        `INSERT INTO seats (showtime_id, seat_number, is_reserved)
         VALUES ($1, $2, $3)`,
        [showtime.id, i, false]
      );
    }

    res.status(201).json({
      message: 'Showtime created successfully and seats generated.',
      showtime
    });
  
});


// Update showtime (admin only)
const updateShowtime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { movie_id, start_time, end_time, screen_number, capacity } = req.body;

  
    const result = await pool.query(
      `UPDATE showtimes
       SET movie_id = $1, start_time = $2, end_time = $3, screen_number = $4, capacity = $5
       WHERE id = $6 RETURNING *`,
      [movie_id, start_time, end_time, screen_number, capacity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json(result.rows[0]);
  
});

// Delete showtime (admin only)
const deleteShowtime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
    const result = await pool.query('DELETE FROM showtimes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.json({ message: 'Showtime deleted successfully' });
  
});

module.exports = {
  getShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
