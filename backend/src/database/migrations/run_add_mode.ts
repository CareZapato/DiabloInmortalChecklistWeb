import pool from '../../config/database';

const addActivityModeColumns = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Adding modo and preferencia columns to activities table...');

    // Add modo column
    await client.query(`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS modo VARCHAR(20) DEFAULT 'individual' 
      CHECK (modo IN ('individual', 'grupal', 'ambas'));
    `);
    console.log('✅ Added modo column');

    // Add preferencia column
    await client.query(`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS preferencia VARCHAR(20) 
      CHECK (preferencia IN ('individual', 'grupal') OR preferencia IS NULL);
    `);
    console.log('✅ Added preferencia column');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addActivityModeColumns()
  .then(() => {
    console.log('✅ Migration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
