import bcrypt from 'bcryptjs';
import pool from '../config/database';

/**
 * Script para resetear la contraseña de un usuario
 * Uso: npm run reset-password <username> <nueva-contraseña>
 */

async function resetPassword(username: string, newPassword: string) {
  try {
    // Verificar que el usuario existe
    const userCheck = await pool.query(
      'SELECT id, username FROM users WHERE username = $1',
      [username]
    );

    if (userCheck.rows.length === 0) {
      console.error(`❌ Usuario '${username}' no encontrado`);
      process.exit(1);
    }

    const user = userCheck.rows[0];
    console.log(`✅ Usuario encontrado: ${user.username} (ID: ${user.id})`);

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, user.id]
    );

    console.log(`✅ Contraseña actualizada correctamente para '${username}'`);
    console.log(`🔐 Nueva contraseña: ${newPassword}`);
    
    // Verificar que la contraseña funciona
    const verification = await bcrypt.compare(newPassword, password_hash);
    if (verification) {
      console.log('✅ Verificación exitosa: La contraseña se guardó correctamente');
    } else {
      console.log('❌ Error en la verificación');
    }

  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Uso: npm run reset-password <username> <nueva-contraseña>');
  console.log('Ejemplo: npm run reset-password miusuario 123456');
  process.exit(1);
}

const [username, newPassword] = args;

if (newPassword.length < 6) {
  console.error('❌ La contraseña debe tener al menos 6 caracteres');
  process.exit(1);
}

resetPassword(username, newPassword);
