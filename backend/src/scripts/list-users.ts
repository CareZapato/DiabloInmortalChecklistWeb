import pool from '../config/database';

async function listUsers() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users ORDER BY id'
    );

    console.log('\n📋 Usuarios registrados:\n');
    console.log('ID | Username | Email | Fecha de Creación');
    console.log('---|----------|-------|------------------');
    
    result.rows.forEach((user) => {
      console.log(`${user.id} | ${user.username} | ${user.email} | ${user.created_at.toLocaleString()}`);
    });

    console.log(`\n✅ Total: ${result.rows.length} usuario(s)\n`);

  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

listUsers();
