const pool = require('../config/dbConnection');
const asyncHandler = require('express-async-handler');

// Get available seats for a showtime
const getAvailableSeats = asyncHandler(async (req, res) => {
  const { showtimeId } = req.params;
  if (!showtimeId) {
    return res.status(400).json({ message: 'Showtime ID is required' });
  }
  // Get seats that are NOT reserved
  const result = await pool.query(
    `SELECT id, seat_number FROM seats
     WHERE showtime_id = $1 AND is_reserved = false
     ORDER BY seat_number`,
      [showtimeId]
    );
    res.json(result.rows);
 
});

// Reserve seats for a showtime
const reserveSeats = asyncHandler( async (req, res) => {
  const userId = req.user.id;
  const { showtimeId } = req.params;
  const { seatIds } = req.body; // array of seat ids user wants to reserve

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: 'No seats selected' });
  }

  const client = await pool.connect();
  try {
  
    await client.query('BEGIN');

    // Check if seats are still available
    const { rows: availableSeats } = await client.query(
      `SELECT id FROM seats WHERE id = ANY($1) AND showtime_id = $2 AND is_reserved = false`,
      [seatIds, showtimeId]
    );

    if (availableSeats.length !== seatIds.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Some seats are already reserved' });
    }

    // Create reservation
    const { rows } = await client.query(
      `INSERT INTO reservations (user_id, showtime_id) VALUES ($1, $2) RETURNING id`,
      [userId, showtimeId]
    );
    const reservationId = rows[0].id;

    // Mark seats reserved
    await client.query(
      `UPDATE seats SET is_reserved = true WHERE id = ANY($1)`,
      [seatIds]
    );

    // Insert into reservation_seats
    const insertPromises = seatIds.map((seatId) =>
      client.query(
        `INSERT INTO reservation_seats (reservation_id, seat_id) VALUES ($1, $2)`,
        [reservationId, seatId]
      )
    );
    await Promise.all(insertPromises);

    await client.query('COMMIT');

    res.status(201).json({ message: 'Reservation successful', reservationId })
  } finally{
    client.release();
  };
  
});

// Get reservations for logged-in user
const getUserReservations = asyncHandler( async (req, res) => {
  const userId = req.user.id;
  
    const result = await pool.query(
      `SELECT 
         r.id AS reservation_id, 
         r.created_at, 
         s.id AS showtime_id, 
         m.title AS movie_title, 
         s.start_time, 
         s.end_time,
         ARRAY_AGG(seats.seat_number ORDER BY seats.seat_number) AS seats
       FROM reservations r
       JOIN showtimes s ON r.showtime_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN reservation_seats rs ON rs.reservation_id = r.id
       JOIN seats ON rs.seat_id = seats.id
       WHERE r.user_id = $1
       GROUP BY r.id, s.id, m.id
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  
});


// Cancel a reservation (only upcoming ones)
const cancelReservation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // reservation id

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check reservation exists, belongs to user, and showtime is upcoming
    const { rows } = await client.query(
      `SELECT r.id, s.start_time FROM reservations r
       JOIN showtimes s ON r.showtime_id = s.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (new Date(rows[0].start_time) <= new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot cancel past or ongoing reservations' });
    }

    // Get reserved seat ids for the reservation
    const seatRes = await client.query(
      `SELECT seat_id FROM reservation_seats WHERE reservation_id = $1`,
      [id]
    );
    const seatIds = seatRes.rows.map((r) => r.seat_id);

    // Free up seats
    await client.query(
      `UPDATE seats SET is_reserved = false WHERE id = ANY($1)`,
      [seatIds]
    );

    // Delete reservation seats entries
    await client.query(
      `DELETE FROM reservation_seats WHERE reservation_id = $1`,
      [id]
    );

    // Delete reservation
    await client.query(
      `DELETE FROM reservations WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Reservation cancelled' });
  }  finally {
    client.release();
  }
});

module.exports = {
  getAvailableSeats,
  reserveSeats,
  getUserReservations,
  cancelReservation,
};
