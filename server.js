// server.js
const app = require('./app');
const dotenv = require('dotenv');
const pool = require('./config/dbConnection');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Optional DB test
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', result.rows[0].now);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
