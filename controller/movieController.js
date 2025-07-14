const pool = require('../config/dbConnection');

// GET all movies
const getAllMovies = async (req, res) => {
  const result = await pool.query(
    `SELECT movies.*, genres.name AS genre 
     FROM movies 
     LEFT JOIN genres ON movies.genre_id = genres.id`
  );
  res.json(result.rows);
};

// GET one movie
const getMovieById = async (req, res) => {
  const result = await pool.query(
    `SELECT movies.*, genres.name AS genre 
     FROM movies 
     LEFT JOIN genres ON movies.genre_id = genres.id 
     WHERE movies.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  res.json(result.rows[0]);
};

// POST create movie
const createMovie = async (req, res) => {
  const { title, description, poster_url, genre_id } = req.body;
  const created_by = req.user.id;

  // Null/undefined validation
  if (!title || !description || !poster_url || !genre_id) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO movies (title, description, poster_url, genre_id, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, poster_url, genre_id, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating movie:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// PUT update movie
const updateMovie = async (req, res) => {
  const { title, description, poster_url, genre_id } = req.body;
  const { id } = req.params;

  if (!title || !description || !poster_url || !genre_id) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE movies 
       SET title = $1, description = $2, poster_url = $3, genre_id = $4 
       WHERE id = $5 RETURNING *`,
      [title, description, poster_url, genre_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating movie:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// DELETE movie
const deleteMovie = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`DELETE FROM movies WHERE id = $1 RETURNING *`, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json({ message: 'Movie deleted successfully' });
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
