
// scripts/seedAdmin.js
const bcrypt = require('bcryptjs');
const pool = require('../config/dbConnection');

const seedAdmin = async () => {
  try {
    const name = 'Admin User';
    const email = 'admin@example.com';
    const plainPassword = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, 'admin']
    );

    console.log('✅ Admin user seeded:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
