import bcrypt from 'bcryptjs';
import pool from '../config/database';

const createDemoUser = async () => {
  try {
    console.log('🔍 Checking for demo user...');

    // Check if demo user exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['demo']
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Demo user already exists');
      process.exit(0);
    }

    // Hash password: demo123
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    // Create demo user
    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      ['demo', 'demo@example.com', passwordHash]
    );

    console.log('✅ Demo user created successfully');
    console.log('   Username: demo');
    console.log('   Password: demo123');
    console.log('   Email: demo@example.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    process.exit(1);
  }
};

createDemoUser();
