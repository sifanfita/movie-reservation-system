const pool = require('../config/dbConnection');
const asyncHandler = require('express-async-handler');

// ✅ Promote a user to admin
const promoteToAdmin = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE id = $1 RETURNING id, name, email, role`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User promoted to admin', user: result.rows[0] });
  
});

// ✅ View all reservations
const getAllReservations = asyncHandler(async (req, res) => {
  
    const result = await pool.query(
      `SELECT r.id AS reservation_id,
              u.name AS user_name,
              u.email AS user_email,
              m.title AS movie_title,
              s.start_time,
              s.screen_number,
              r.created_at
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN showtimes s ON r.showtime_id = s.id
       JOIN movies m ON s.movie_id = m.id
       ORDER BY r.created_at DESC`
    );

    res.json(result.rows);
  
});

// ✅ Get showtime revenue & capacity stats
const getStats = asyncHandler( async (req, res) => {
  
    const result = await pool.query(`
      SELECT 
        s.id AS showtime_id,
        m.title AS movie_title,
        s.start_time,
        s.screen_number,
        s.capacity,
        s.ticket_price,
        COUNT(rs.seat_id) AS reserved_seats,
        COUNT(rs.seat_id) * s.ticket_price AS revenue
      FROM showtimes s
      LEFT JOIN movies m ON s.movie_id = m.id
      LEFT JOIN reservations r ON s.id = r.showtime_id
      LEFT JOIN reservation_seats rs ON r.id = rs.reservation_id
      GROUP BY s.id, m.title
      ORDER BY s.start_time DESC;
    `);

    res.json(result.rows);
  
});

module.exports = {
  promoteToAdmin,
  getAllReservations,
  getStats,
};
