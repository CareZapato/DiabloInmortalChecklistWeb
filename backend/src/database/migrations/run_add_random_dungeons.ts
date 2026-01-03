import pool from '../../config/database';
import * as fs from 'fs';
import * as path from 'path';

const addRandomDungeonsActivity = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Adding random dungeons activity...');

    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'add_random_dungeons_activity.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Random dungeons activity added successfully!');
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addRandomDungeonsActivity()
  .then(() => {
    console.log('✅ Migration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
