import pool from '../../config/database';

/**
 * Migración v2.5: Sistema de Recompensas Normalizado
 * 
 * Esta migración convierte el sistema de recompensas de arrays de texto
 * a tablas normalizadas con relaciones many-to-many.
 * 
 * Cambios:
 * 1. Crea tabla rewards con id, nombre, descripcion
 * 2. Crea tablas event_rewards y activity_rewards (relaciones)
 * 3. Migra datos existentes de recompensas TEXT[] a las nuevas tablas
 * 4. Elimina columnas recompensas de activities y scheduled_events
 */

const runMigration = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration v2.5: Reward System Normalization...\n');

    // 1. Crear tabla rewards
    console.log('Step 1: Creating rewards table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Rewards table created\n');

    // 2. Crear tablas de relación
    console.log('Step 2: Creating relationship tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_rewards (
        event_id VARCHAR(100) NOT NULL REFERENCES scheduled_events(id) ON DELETE CASCADE,
        reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
        cantidad INTEGER,
        PRIMARY KEY (event_id, reward_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_rewards (
        activity_id VARCHAR(100) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
        cantidad INTEGER,
        PRIMARY KEY (activity_id, reward_id)
      );
    `);
    console.log('✅ Relationship tables created\n');

    // 3. Crear índices
    console.log('Step 3: Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_event_rewards_reward_id ON event_rewards(reward_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activity_rewards_reward_id ON activity_rewards(reward_id);');
    console.log('✅ Indexes created\n');

    // 4. Insertar recompensas base
    console.log('Step 4: Seeding rewards...');
    const rewards = [
      // Recompensas de eventos
      { id: 'battle_points', nombre: 'Puntos de batalla', descripcion: 'Puntos para avanzar en el ranking y recompensas de temporada del Campo de Batalla' },
      { id: 'high_quality_equipment', nombre: 'Equipo de alta calidad', descripcion: 'Equipo legendario y objetos de calidad para mejorar tu personaje' },
      { id: 'gold', nombre: 'Oro', descripcion: 'Moneda principal del juego para compras y mejoras' },
      { id: 'xp', nombre: 'Experiencia (XP)', descripcion: 'Experiencia para subir de nivel y desbloquear contenido' },
      
      // Recompensas de actividades
      { id: 'normal_gems', nombre: 'Gemas normales', descripcion: 'Gemas para mejorar atributos secundarios. Las no vinculadas son vendibles' },
      { id: 'normal_gems_bound', nombre: 'Gemas normales vinculadas', descripcion: 'Gemas normales vinculadas a la cuenta, no vendibles' },
      { id: 'rare_crests', nombre: 'Cimeras raras', descripcion: 'Cimeras gratuitas para mejorar recompensas de Fisuras Antiguas' },
      { id: 'legendary_crests', nombre: 'Cimeras legendarias', descripcion: 'Cimeras premium para obtener gemas legendarias de Fisuras Antiguas' },
      { id: 'fading_embers', nombre: 'Brasas debilitadas', descripcion: 'Moneda especial para crear cimeras legendarias en el joyero' },
      { id: 'platinum', nombre: 'Platino', descripcion: 'Moneda premium obtenible vendiendo items en el mercado' },
      { id: 'abyssal_essence', nombre: 'Esencias abisales', descripcion: 'Esencias obtenidas en Límite Abisal y Erebban' },
      { id: 'monster_essence', nombre: 'Esencias de monstruos', descripcion: 'Esencias para el bestiario y mejoras' },
      { id: 'terror_essence', nombre: 'Esencias del Terror', descripcion: 'Esencias vendibles o usables para obtener equipo legendario con magias eternas' },
      { id: 'battle_pass_points', nombre: 'Puntos de pase de batalla', descripcion: 'Puntos para avanzar en el pase de batalla y obtener recompensas' },
      { id: 'materials', nombre: 'Materiales', descripcion: 'Materiales diversos para crafting y mejoras' },
      { id: 'scoria', nombre: 'Rodolita', descripcion: 'Material clave para refinar y mejorar equipo en endgame' },
      { id: 'legendary_items', nombre: 'Objetos legendarios', descripcion: 'Equipo legendario con potencial de magias eternas' },
      { id: 'eternal_legendary', nombre: 'Legendario eterno excepcional', descripcion: 'Legendario garantizado de alta calidad con magias eternas' },
      { id: 'reforge_stones', nombre: 'Piedras de reforja', descripcion: 'Piedras para reforjar estadísticas del equipo' },
      { id: 'horadrim_materials', nombre: 'Materiales del Santuario Horádrim', descripcion: 'Materiales para progresar en el Legado de los Horadrim' }
    ];

    for (const reward of rewards) {
      await client.query(
        `INSERT INTO rewards (id, nombre, descripcion) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (id) DO NOTHING`,
        [reward.id, reward.nombre, reward.descripcion]
      );
    }
    console.log(`✅ Seeded ${rewards.length} rewards\n`);

    // 5. Migrar recompensas de eventos existentes
    console.log('Step 5: Migrating event rewards...');
    const eventRewards = [
      // Campo de Batalla
      { event_id: 'battlefield', reward_id: 'battle_points', cantidad: null },
      { event_id: 'battlefield', reward_id: 'high_quality_equipment', cantidad: null },
      
      // Carruaje Poseído
      { event_id: 'haunted_carriage', reward_id: 'high_quality_equipment', cantidad: null },
      { event_id: 'haunted_carriage', reward_id: 'gold', cantidad: null },
      { event_id: 'haunted_carriage', reward_id: 'xp', cantidad: null },
      
      // Asalto a la Cámara
      { event_id: 'vault_raid', reward_id: 'high_quality_equipment', cantidad: null },
      { event_id: 'vault_raid', reward_id: 'gold', cantidad: null },
      { event_id: 'vault_raid', reward_id: 'xp', cantidad: null },
      
      // Reunión de las Sombras
      { event_id: 'shadow_assembly', reward_id: 'high_quality_equipment', cantidad: null },
      { event_id: 'shadow_assembly', reward_id: 'gold', cantidad: null },
      { event_id: 'shadow_assembly', reward_id: 'xp', cantidad: null },
      
      // Arena Ancestral
      { event_id: 'ancient_arena', reward_id: 'high_quality_equipment', cantidad: null },
      { event_id: 'ancient_arena', reward_id: 'gold', cantidad: null },
      { event_id: 'ancient_arena', reward_id: 'xp', cantidad: null }
    ];

    for (const eventReward of eventRewards) {
      await client.query(
        `INSERT INTO event_rewards (event_id, reward_id, cantidad) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (event_id, reward_id) DO NOTHING`,
        [eventReward.event_id, eventReward.reward_id, eventReward.cantidad]
      );
    }
    console.log(`✅ Migrated ${eventRewards.length} event rewards\n`);

    // 6. Migrar recompensas de actividades
    console.log('Step 6: Migrating activity rewards...');
    const activityRewards = [
      // Gemas normales diarias
      { activity_id: 'daily_gemas_party4', reward_id: 'normal_gems', cantidad: 12 },
      { activity_id: 'daily_gemas_party4', reward_id: 'normal_gems_bound', cantidad: null },
      
      // Capeo semanal gemas
      { activity_id: 'weekly_gemas_cap_63_63', reward_id: 'normal_gems_bound', cantidad: 63 },
      { activity_id: 'weekly_gemas_cap_63_63', reward_id: 'normal_gems', cantidad: 63 },
      
      // Cimeras raras gratuitas
      { activity_id: 'daily_elder_rift_claim', reward_id: 'rare_crests', cantidad: null },
      
      // Fisura Antigua (brasas)
      { activity_id: 'weekly_elder_rift_embers', reward_id: 'fading_embers', cantidad: null },
      { activity_id: 'weekly_elder_rift_embers', reward_id: 'battle_pass_points', cantidad: 8 },
      
      // Esencias abisales a Rayek
      { activity_id: 'daily_abyssal_essence_rayek', reward_id: 'abyssal_essence', cantidad: 10 },
      { activity_id: 'daily_abyssal_essence_rayek', reward_id: 'battle_pass_points', cantidad: 40 },
      { activity_id: 'daily_abyssal_essence_rayek', reward_id: 'monster_essence', cantidad: null },
      
      // Bestiario
      { activity_id: 'daily_bestiario', reward_id: 'monster_essence', cantidad: 10 },
      { activity_id: 'daily_bestiario', reward_id: 'battle_pass_points', cantidad: null },
      { activity_id: 'daily_bestiario', reward_id: 'legendary_items', cantidad: null },
      
      // Campo de batalla (temporada)
      { activity_id: 'season_pvp_battleground_3', reward_id: 'normal_gems', cantidad: null },
      { activity_id: 'season_pvp_battleground_3', reward_id: 'legendary_crests', cantidad: null },
      { activity_id: 'season_pvp_battleground_3', reward_id: 'reforge_stones', cantidad: null },
      
      // Inferlicario
      { activity_id: 'weekly_inferlicario', reward_id: 'legendary_crests', cantidad: null },
      { activity_id: 'weekly_inferlicario', reward_id: 'materials', cantidad: null },
      
      // Fisuras del terror
      { activity_id: 'weekly_terror_rifts', reward_id: 'terror_essence', cantidad: 1 },
      { activity_id: 'weekly_terror_rifts', reward_id: 'legendary_items', cantidad: null },
      { activity_id: 'weekly_terror_rifts', reward_id: 'materials', cantidad: null },
      
      // Consumir esencias del terror
      { activity_id: 'weekly_consume_10_terror_essence', reward_id: 'eternal_legendary', cantidad: 1 },
      { activity_id: 'weekly_consume_10_terror_essence', reward_id: 'scoria', cantidad: null },
      
      // Materiales (rodolita)
      { activity_id: 'weekly_materials_rodolita6', reward_id: 'scoria', cantidad: 6 },
      
      // Mercado de jugadores
      { activity_id: 'daily_player_market', reward_id: 'platinum', cantidad: null },
      
      // Legado Horadrim
      { activity_id: 'daily_horadrim_iben', reward_id: 'horadrim_materials', cantidad: null },
      
      // Cimeras de temporada
      { activity_id: 'season_kion_or_shadows', reward_id: 'legendary_crests', cantidad: 1 },
      { activity_id: 'season_clan_towers_crests', reward_id: 'legendary_crests', cantidad: 2 },
      { activity_id: 'season_merchant_crest_platinum', reward_id: 'legendary_crests', cantidad: 1 },
      { activity_id: 'season_clan_ticket_crest', reward_id: 'legendary_crests', cantidad: 1 },
      { activity_id: 'season_immortals_shop_crest', reward_id: 'legendary_crests', cantidad: 1 }
    ];

    for (const activityReward of activityRewards) {
      await client.query(
        `INSERT INTO activity_rewards (activity_id, reward_id, cantidad) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (activity_id, reward_id) DO NOTHING`,
        [activityReward.activity_id, activityReward.reward_id, activityReward.cantidad]
      );
    }
    console.log(`✅ Migrated ${activityRewards.length} activity rewards\n`);

    // 7. Eliminar columnas antiguas (OPCIONAL - solo si estás seguro)
    console.log('Step 7: Removing old columns...');
    console.log('⚠️  SKIPPING removal of old columns for safety.');
    console.log('   To manually remove old columns, run:');
    console.log('   ALTER TABLE activities DROP COLUMN IF EXISTS recompensas;');
    console.log('   ALTER TABLE scheduled_events DROP COLUMN IF EXISTS recompensas;\n');
    
    // Descomentar si quieres eliminar las columnas automáticamente:
    // await client.query('ALTER TABLE activities DROP COLUMN IF EXISTS recompensas;');
    // await client.query('ALTER TABLE scheduled_events DROP COLUMN IF EXISTS recompensas;');
    // console.log('✅ Old columns removed\n');

    // Mostrar resumen
    console.log('📊 Migration Summary:');
    const rewardCount = await client.query('SELECT COUNT(*) FROM rewards');
    const eventRewardCount = await client.query('SELECT COUNT(*) FROM event_rewards');
    const activityRewardCount = await client.query('SELECT COUNT(*) FROM activity_rewards');
    
    console.log(`  - Rewards: ${rewardCount.rows[0].count}`);
    console.log(`  - Event-Reward relations: ${eventRewardCount.rows[0].count}`);
    console.log(`  - Activity-Reward relations: ${activityRewardCount.rows[0].count}`);
    console.log();

    console.log('🎉 Migration v2.5 completed successfully!');

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
