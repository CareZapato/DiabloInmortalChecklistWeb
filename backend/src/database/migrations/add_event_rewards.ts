import pool from '../../config/database';

const runMigration = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration: add event rewards and update data...');

    // 1. Agregar columna recompensas si no existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'scheduled_events' 
      AND column_name = 'recompensas'
    `);

    if (checkColumn.rows.length === 0) {
      await client.query(`
        ALTER TABLE scheduled_events 
        ADD COLUMN recompensas TEXT[] DEFAULT '{}'
      `);
      console.log('✅ Column recompensas added');
    } else {
      console.log('ℹ️  Column recompensas already exists');
    }

    // 2. Actualizar Campo de Batalla
    await client.query(`
      UPDATE scheduled_events SET 
        nombre = $1,
        horarios = $2,
        duracion_minutos = $3,
        recompensas = $4
      WHERE id = $5
    `, ['Campo de Batalla', ['08:00', '12:00', '18:00', '22:00'], 60, ['Puntos de batalla', 'Equipo de alta calidad'], 'battlefield']);
    console.log('✅ Updated: Campo de Batalla');

    // 3. Eliminar eventos antiguos
    await client.query(`DELETE FROM scheduled_events WHERE id IN ('ancient_nightmare', 'demonic_gates')`);
    console.log('✅ Removed old events');

    // 4. Insertar/Actualizar Carruaje Poseído
    await client.query(`
      INSERT INTO scheduled_events (id, nombre, horarios, duracion_minutos, descripcion, tipo, recompensas)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        horarios = EXCLUDED.horarios,
        duracion_minutos = EXCLUDED.duracion_minutos,
        descripcion = EXCLUDED.descripcion,
        tipo = EXCLUDED.tipo,
        recompensas = EXCLUDED.recompensas
    `, [
      'haunted_carriage',
      'Carruaje Poseído',
      ['12:00', '20:30', '22:00'],
      30,
      'Escolta el carruaje hasta su destino mientras defiendes contra oleadas de enemigos.',
      'world_event',
      ['Equipo de alta calidad', 'Oro', 'Experiencia (XP)']
    ]);
    console.log('✅ Inserted/Updated: Carruaje Poseído');

    // 5. Actualizar Asalto a la Cámara
    await client.query(`
      UPDATE scheduled_events SET 
        horarios = $1,
        recompensas = $2
      WHERE id = $3
    `, [['12:00', '19:00'], ['Equipo de alta calidad', 'Oro', 'Experiencia (XP)'], 'vault_raid']);
    console.log('✅ Updated: Asalto a la Cámara');

    // 6. Actualizar Reunión de las Sombras
    await client.query(`
      UPDATE scheduled_events SET 
        recompensas = $1
      WHERE id = $2
    `, [['Equipo de alta calidad', 'Oro', 'Experiencia (XP)'], 'shadow_assembly']);
    console.log('✅ Updated: Reunión de las Sombras');

    // 7. Insertar/Actualizar Arena Ancestral
    await client.query(`
      INSERT INTO scheduled_events (id, nombre, horarios, duracion_minutos, descripcion, tipo, recompensas)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        horarios = EXCLUDED.horarios,
        duracion_minutos = EXCLUDED.duracion_minutos,
        descripcion = EXCLUDED.descripcion,
        tipo = EXCLUDED.tipo,
        recompensas = EXCLUDED.recompensas
    `, [
      'ancient_arena',
      'Arena Ancestral',
      ['21:30'],
      30,
      'Combate PvP en la arena ancestral. Demuestra tu habilidad contra otros jugadores.',
      'pvp',
      ['Equipo de alta calidad', 'Oro', 'Experiencia (XP)']
    ]);
    console.log('✅ Inserted/Updated: Arena Ancestral');

    // Mostrar resultados finales
    const result = await client.query('SELECT id, nombre, horarios, recompensas FROM scheduled_events ORDER BY id');
    console.log('\n📋 Current events:');
    result.rows.forEach(row => {
      console.log(`  - ${row.nombre} (${row.id})`);
      console.log(`    Horarios: ${row.horarios.join(', ')}`);
      console.log(`    Recompensas: ${row.recompensas ? row.recompensas.join(', ') : 'N/A'}`);
    });

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration
runMigration()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
