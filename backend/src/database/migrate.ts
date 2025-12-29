import pool from '../config/database';

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Creating database tables...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('diaria', 'semanal', 'temporada')),
        prioridad VARCHAR(3) NOT NULL CHECK (prioridad IN ('S+', 'S', 'A+', 'A', 'B+', 'B', 'C')),
        tiempo_aprox VARCHAR(100),
        recompensas TEXT,
        mejora TEXT,
        detalle TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Activities table created');

    // Create user_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_id VARCHAR(100) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        completed_date DATE NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, activity_id, completed_date)
      );
    `);
    console.log('✅ User progress table created');

    // Create scheduled_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduled_events (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        horarios TEXT[] NOT NULL,
        duracion_minutos INTEGER NOT NULL,
        descripcion TEXT,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('pvp', 'faction', 'world_event')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Scheduled events table created');

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(completed_date);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_tipo ON activities(tipo);');

    console.log('✅ Indexes created');
    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
createTables()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
