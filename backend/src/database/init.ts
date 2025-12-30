import pool from '../config/database';

/**
 * Verifica si las tablas de la base de datos existen
 */
export async function checkDatabaseTables(): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'activities', 'user_progress', 'scheduled_events', 'rewards', 'event_rewards', 'activity_rewards')
    `);
    
    return result.rows.length === 7;
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
}

/**
 * Crea todas las tablas necesarias
 */
export async function createTables(): Promise<void> {
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
    console.log('✅ Users table ready');

    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('diaria', 'semanal', 'temporada')),
        prioridad VARCHAR(3) NOT NULL CHECK (prioridad IN ('S+', 'S', 'A+', 'A', 'B+', 'B', 'C')),
        tiempo_aprox VARCHAR(100),
        mejora TEXT,
        detalle TEXT,
        modo VARCHAR(20) DEFAULT 'individual' CHECK (modo IN ('individual', 'grupal', 'ambas')),
        preferencia VARCHAR(20) CHECK (preferencia IN ('individual', 'grupal') OR preferencia IS NULL),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Activities table ready');

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
    console.log('✅ User progress table ready');

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
    console.log('✅ Scheduled events table ready');

    // Create rewards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Rewards table ready');

    // Create event_rewards table (many-to-many)
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_rewards (
        event_id VARCHAR(100) NOT NULL REFERENCES scheduled_events(id) ON DELETE CASCADE,
        reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
        cantidad INTEGER,
        PRIMARY KEY (event_id, reward_id)
      );
    `);
    console.log('✅ Event rewards table ready');

    // Create activity_rewards table (many-to-many)
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_rewards (
        activity_id VARCHAR(100) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        reward_id VARCHAR(100) NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
        cantidad INTEGER,
        PRIMARY KEY (activity_id, reward_id)
      );
    `);
    console.log('✅ Activity rewards table ready');

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(completed_date);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_tipo ON activities(tipo);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_event_rewards_reward_id ON event_rewards(reward_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activity_rewards_reward_id ON activity_rewards(reward_id);');

    console.log('✅ Indexes created');
    console.log('🎉 Database tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verifica si hay datos en las tablas activities y scheduled_events
 */
export async function checkBaseData(): Promise<boolean> {
  try {
    const activitiesResult = await pool.query('SELECT COUNT(*) FROM activities');
    const eventsResult = await pool.query('SELECT COUNT(*) FROM scheduled_events');
    const rewardsResult = await pool.query('SELECT COUNT(*) FROM rewards');
    
    const activitiesCount = parseInt(activitiesResult.rows[0].count);
    const eventsCount = parseInt(eventsResult.rows[0].count);
    const rewardsCount = parseInt(rewardsResult.rows[0].count);
    
    return activitiesCount > 0 && eventsCount > 0 && rewardsCount > 0;
  } catch (error) {
    console.error('Error checking base data:', error);
    return false;
  }
}

/**
 * Inserta los datos base (actividades y eventos)
 */
export async function seedBaseData(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding base data...');

    // Seed Activities
    const activities = [
      // ===== DIARIAS - TAREAS PREVIAS =====
      {
        id: 'daily_nisza',
        nombre: 'Nisza (expediciones, contratos, familiares)',
        tipo: 'diaria',
        prioridad: 'B',
        tiempo_aprox: '30 seg – 1 min',
        recompensas: 'Expediciones familiares, contratos, compra de familiares.',
        mejora: 'Gestión de recursos y progreso con familiares.',
        detalle: 'Previo a hacer misiones, visita a Nisza para revisar opciones diarias: expediciones familiares, comprar contratos y adquirir familiares según disponibilidad.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'daily_elder_rift_claim',
        nombre: 'Fisura Antigua (reclamar cimeras raras gratuitas)',
        tipo: 'diaria',
        prioridad: 'A+',
        tiempo_aprox: '20 segundos',
        recompensas: 'Cimeras raras gratuitas diarias.',
        mejora: 'Resonancia sin costo adicional.',
        detalle: 'Presentarse diariamente en la Fisura Antigua para reclamar las cimeras raras gratuitas. Solo toma 20 segundos y es progreso garantizado.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'daily_handle_merchant',
        nombre: 'Mercader de empuñadura (revisar ofertas)',
        tipo: 'diaria',
        prioridad: 'C',
        tiempo_aprox: '1 min',
        recompensas: 'Ofertas especiales, sobretodo en tiempos limitados.',
        mejora: 'Aprovechar ofertas con descuento o tiempo limitado.',
        detalle: 'Revisar el mercader de empuñadura diariamente para comprar ofertas especiales, especialmente las de tiempo limitado que pueden tener buen valor.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'daily_player_market',
        nombre: 'Mercado de jugadores (revisar ventas/ofertas)',
        tipo: 'diaria',
        prioridad: 'C',
        tiempo_aprox: '1 min máximo',
        recompensas: 'Platino por ventas, posibles compras estratégicas.',
        mejora: 'Gestión de economía personal.',
        detalle: 'Revisar si se vendieron tus artículos en el mercado o buscar ofertas interesantes. Toma máximo 1 minuto y mantiene tu economía activa.',
        modo: 'individual',
        preferencia: null
      },
      // ===== DIARIAS - ACTIVIDADES PRINCIPALES =====
      {
        id: 'daily_gemas_party4',
        nombre: 'Hallazgo de gemas normales (Límite Abisal en grupo / Erebban solo)',
        tipo: 'diaria',
        prioridad: 'S+',
        tiempo_aprox: '4 min en grupo (Límite Abisal) / 20-60 min solo (Erebban)',
        recompensas: 'Hasta 12 gemas normales NO vinculadas/día (vendibles) + también vinculadas.',
        mejora: 'Platino constante (si vendes) y progreso de atributos secundarios al mejorar gemas normales.',
        detalle: 'Actividad diaria prioritaria: Límite Abisal en grupo de 4 es lo más eficiente (aprox 4 min). También se puede farmear en Castillo de Erebban en solitario (más lento). Los enemigos sueltan gemas normales; recoge hasta 12 no vinculadas cada día. Las que dejes pasar reaparecen como vinculadas.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'daily_misiones_tablero',
        nombre: 'Misiones diarias (Tablero de misiones)',
        tipo: 'diaria',
        prioridad: 'B',
        tiempo_aprox: '15–35 min (8 misiones)',
        recompensas: 'Experiencia, materiales, algunos ítems. Variante usando Esencias del Terror para garantizar drop de ítems eternos con magias eternas.',
        mejora: 'Progreso estable (XP/materiales) y acceso a equipo eterno con magias eternas para builds.',
        detalle: 'Completa al menos 8 misiones del tablero cada día para mantener el ritmo; si no juegas una jornada, las tareas pendientes se acumulan.',
        modo: 'ambas',
        preferencia: 'individual'
      },
      {
        id: 'daily_abyssal_essence_rayek',
        nombre: 'Esencias abisales a Rayek (10 esencias)',
        tipo: 'diaria',
        prioridad: 'B+',
        tiempo_aprox: 'Pasivo durante farmeo',
        recompensas: '40 puntos de pase de batalla + esencias de monstruos.',
        mejora: 'Progreso de pase y materiales adicionales.',
        detalle: 'Al farmear en Límite Abisal o Erebban, consigue 10 esencias abisales. Al obtenerlas, entrégalas a Rayek para recibir 40 puntos del pase de batalla más esencias de monstruos. Se completa de forma pasiva mientras farmeas gemas.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'daily_bestiario',
        nombre: 'Bestiario (10 esencias / \'bolitas\')',
        tipo: 'diaria',
        prioridad: 'B',
        tiempo_aprox: '5–20 min (a menudo pasivo)',
        recompensas: 'Puntos de pase de batalla + posibilidad de legendarios + recompensas varias.',
        mejora: 'Sube el Pase y puede aportar legendarios mientras haces otras actividades.',
        detalle: 'Llena el bestiario entregando 10 esencias mientras exploras el mundo abierto; avanza casi sin dedicar tiempo adicional.',
        modo: 'ambas',
        preferencia: 'individual'
      },
      {
        id: 'daily_double_reward_check',
        nombre: 'Actividad especial con doble recompensa (revisar códice)',
        tipo: 'diaria',
        prioridad: 'A',
        tiempo_aprox: 'Variable según actividad',
        recompensas: 'Doble recompensa de la actividad seleccionada.',
        mejora: 'Maximizar eficiencia del tiempo de juego.',
        detalle: 'Revisar el códice diariamente para ver qué actividad tiene doble recompensa activa. Prioriza hacer esa actividad para maximizar ganancias. La actividad con bonus cambia diariamente.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'season_pvp_battleground_3',
        nombre: 'Campo de batalla (3 primeras partidas)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '20–45 min',
        recompensas: 'Diario: recompensas potenciadas menores. Temporada: progreso a recompensas grandes: gemas normales, cimeras legendarias, piedras de reforja.',
        mejora: 'Avanza recompensas de temporada y mejora refinamiento del equipo (piedras de reforja).',
        detalle: 'Juega las 3 primeras partidas del día para progresar en las recompensas de temporada de 3 meses; es la actividad PvP más rentable.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'season_pvp_torres_3',
        nombre: 'Guerra de torres (3 primeras partidas)',
        tipo: 'temporada',
        prioridad: 'B',
        tiempo_aprox: '20–45 min',
        recompensas: 'Temporada: gemas normales (menos importante que Campo de batalla).',
        mejora: 'Complementa progreso de temporada si tienes tiempo o clan activo.',
        detalle: 'Juega las primeras partidas solo si ya completaste Campo de batalla; aporta progreso extra pero con menor prioridad.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'daily_horadrim_iben',
        nombre: 'Legado de los Horadrim (Santuario de Iben Fahd - primer cofre)',
        tipo: 'diaria',
        prioridad: 'C',
        tiempo_aprox: '3–10 min (manual) / pasivo con mascotas',
        recompensas: 'Materiales del Santuario (progreso de recipientes Horádrim).',
        mejora: 'Progreso lento pero permanente en estadísticas del Santuario.',
        detalle: 'Abre el primer cofre del Santuario cuando tengas unos minutos o envía mascotas; suma mejoras permanentes aunque el ritmo sea lento.',
        modo: 'individual',
        preferencia: null
      },
      // ===== SEMANALES =====
      {
        id: 'weekly_gemas_cap_63_63',
        nombre: 'Capeo semanal gemas normales (Límite Abisal / Castillo de Erebban / Guaridas ocultas)',
        tipo: 'semanal',
        prioridad: 'S+',
        tiempo_aprox: '45–120 min',
        recompensas: 'Tope semanal: 63 gemas vinculadas + 63 no vinculadas (vendibles). Da platino y moneda de cambio.',
        mejora: 'Atributos secundarios + platino. Si no lo haces, te atrasas.',
        detalle: 'Asegura el cap de 63 gemas vinculadas y 63 no vinculadas antes de que termine la semana, ya sea en Límite Abisal, Castillo de Erebban o Guaridas ocultas.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'weekly_elder_rift_embers',
        nombre: 'Fisura Antigua (Elder Rift) - Brasas debilitadas',
        tipo: 'semanal',
        prioridad: 'S',
        tiempo_aprox: '2 min por run / 30-90 min semanal',
        recompensas: 'Brasas debilitadas (objetos únicos) para crear cimeras legendarias con el joyero + 8 puntos del códice por run.',
        mejora: 'Progreso de resonancia (cimeras legendarias) y puntos de códice.',
        detalle: 'Corre Fisuras Antiguas para conseguir brasas debilitadas, que son objetos únicos. Con ellas puedes crear cimeras legendarias visitando al joyero. Cada run toma aprox 2 minutos y otorga 8 puntos del códice. Consigue el tope semanal para maximizar recursos.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'weekly_inferlicario',
        nombre: 'Inferlicario (Helliquary) con cofradía',
        tipo: 'semanal',
        prioridad: 'A+',
        tiempo_aprox: '20–60 min',
        recompensas: 'Recompensas del sistema Helliquary (materiales y progreso) y fuente importante de cimeras/crests según el enfoque del video.',
        mejora: 'Impacta progreso permanente (resonancia y/o stats) y no se recupera si lo saltas.',
        detalle: 'Coordina con la cofradía para limpiar jefes del Inferlicario; cada run deja materiales clave y cimeras para tu resonancia.',
        modo: 'grupal',
        preferencia: null
      },
      {
        id: 'weekly_boss_diablo',
        nombre: 'Desafío de Jefe de Diablo (1/semana)',
        tipo: 'semanal',
        prioridad: 'B',
        tiempo_aprox: '10–20 min',
        recompensas: 'Puntos de pase de batalla + recompensas varias y equipo eterno (según el video).',
        mejora: 'Útil para equiparte si estás en fase de mejora; prescindible si no.',
        detalle: 'Haz el enfrentamiento semanal contra Diablo si necesitas equipo eterno o puntos de pase; puedes saltarlo cuando el tiempo es limitado.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'weekly_terror_rifts',
        nombre: 'Fisuras del terror (Terror Rifts)',
        tipo: 'semanal',
        prioridad: 'B+',
        tiempo_aprox: '3 min por run hasta conseguir 1 esencia / 20-60 min semanal',
        recompensas: 'Esencias del Terror (vendibles en mercado por platino o usables en misiones/pilares), equipo legendario con magias eternas, materiales.',
        mejora: 'Genera platino y/o te prepara para mejoras de equipo; guardar para Vientos de la Fortuna.',
        detalle: 'Corre fisuras terroríficas hasta que salga 1 esencia del terror (aprox 3 min por run). Las esencias son vendibles en el mercado por platino o usables para consumir en misiones y pilares. También dropean legendarios con magias eternas.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'weekly_consume_10_terror_essence',
        nombre: 'Consumir 10 esencias del terror (semanal)',
        tipo: 'semanal',
        prioridad: 'B+',
        tiempo_aprox: '10–30 min',
        recompensas: 'Legendario garantizado excepcional (alta calidad con magias eternas) + materiales (incluye rodolita según el video).',
        mejora: 'Sirve para actualizar equipo legendario cuando lo necesitas.',
        detalle: 'Consume 10 esencias cuando busques un legendario garantizado; si tu equipo está estable, conserva la reserva para más adelante.',
        modo: 'ambas',
        preferencia: 'individual'
      },
      {
        id: 'monthly_oblivion_pillars',
        nombre: 'Pilares del olvido (objetivo 70/semana, recomendado 1 vez al mes)',
        tipo: 'semanal',
        prioridad: 'C',
        tiempo_aprox: '0–120 min (solo si farmeas fuerte)',
        recompensas: 'Materiales + equipo legendario, útil para sesiones de actualización.',
        mejora: 'Mejor para un \'upgrade day\' mensual, ideal con Vientos de la Fortuna.',
        detalle: 'Acumula pilares y gástalos en una sesión mensual de farmeo intenso para maximizar los bonus de Vientos de la Fortuna.',
        modo: 'ambas',
        preferencia: 'individual'
      },
      {
        id: 'weekly_vanguard',
        nombre: 'Vanguardia (Vanguard)',
        tipo: 'semanal',
        prioridad: 'C',
        tiempo_aprox: '20–60 min',
        recompensas: 'Recompensas varias (verdes/legendarios) y premios por temporada según talismán (según el video).',
        mejora: 'Extra opcional, no core.',
        detalle: 'Participa en Vanguard solo si disfrutas la actividad o necesitas sus recompensas de temporada; es completamente opcional.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'weekly_materials_rodolita6',
        nombre: 'Recolectar materiales (priorizar Rodolita x6)',
        tipo: 'semanal',
        prioridad: 'B',
        tiempo_aprox: 'Pasivo + 10–20 min si falta',
        recompensas: 'Materiales semanales; el video destaca rodolita como clave.',
        mejora: 'Refinar/mejorar equipo en late.',
        detalle: 'La mayor parte de la rodolita llega de forma pasiva; si te falta para subir equipo, dedica 10–20 minutos extra a recolectarla.',
        modo: 'ambas',
        preferencia: 'individual'
      },
      {
        id: 'weekly_call_of_destruction',
        nombre: 'Llamado de la destrucción (1/semana)',
        tipo: 'semanal',
        prioridad: 'C',
        tiempo_aprox: '~10 min',
        recompensas: 'Rodolita + posibilidad de objetos legendarios (según el video).',
        mejora: 'Pequeña ventaja para completar materiales y sumar botín.',
        detalle: 'Haz la invocación semanal para asegurar rodolita extra y algún legendario, aunque no es imprescindible.',
        modo: 'ambas',
        preferencia: 'grupal'
      },

      // ===== TEMPORADA (FUENTES DE CIMERAS) =====
      {
        id: 'season_kion_or_shadows',
        nombre: 'Cimera de Kion (Inmortales) o Guerra de Sombras (Sombras)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '10–30 min',
        recompensas: '1 cimera legendaria (según facción)',
        mejora: 'Resonancia (progreso lineal).',
        detalle: 'Completa la actividad de facción (Inmortales o Sombras) para sumar una cimera semanal dentro de la meta F2P de 5–7 cimeras.',
        modo: 'grupal',
        preferencia: null
      },
      {
        id: 'season_clan_towers_crests',
        nombre: 'Torres de clan (hasta 2 cimeras, a veces 3)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '20–60 min',
        recompensas: 'Hasta 2 cimeras legendarias típicamente (depende del clan/torres).',
        mejora: 'Resonancia (progreso lineal).',
        detalle: 'Participa en torres de clan cuando esté activo tu grupo; suelen otorgar 2 cimeras si la alianza mantiene las conquistas.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'season_merchant_crest_platinum',
        nombre: 'Cimera del mercader (comprar con platino)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '1–2 min',
        recompensas: '1 cimera legendaria (si tienes platino).',
        mejora: 'Convierte economía en resonancia.',
        detalle: 'Reserva platino cada semana para comprar esta cimera en la tienda; es la forma más directa de convertir economía en resonancia.',
        modo: 'individual',
        preferencia: null
      },
      {
        id: 'season_clan_ticket_crest',
        nombre: 'Cimera de la cofradía (con ticket/moneda)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '5–15 min',
        recompensas: '1 cimera legendaria si cumples requisitos.',
        mejora: 'Resonancia.',
        detalle: 'Coordina con tu cofradía para intercambiar tickets o monedas y así asegurar la cimera legendaria semanal.',
        modo: 'ambas',
        preferencia: 'grupal'
      },
      {
        id: 'season_immortals_shop_crest',
        nombre: 'Cimera de inmortal (tienda especial de inmortales)',
        tipo: 'temporada',
        prioridad: 'B',
        tiempo_aprox: '2–5 min',
        recompensas: '1 cimera (solo si eres inmortal).',
        mejora: 'Resonancia.',
        detalle: 'Solo disponible si eres Inmortal; revisa la tienda especial cada semana para no dejar pasar la cimera adicional.',
        modo: 'individual',
        preferencia: null
      }
    ];

    for (const activity of activities) {
      await client.query(
        `INSERT INTO activities (id, nombre, tipo, prioridad, tiempo_aprox, mejora, detalle, modo, preferencia) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [activity.id, activity.nombre, activity.tipo, activity.prioridad, activity.tiempo_aprox, activity.mejora, activity.detalle, activity.modo || 'individual', activity.preferencia || null]
      );
    }
    console.log(`✅ Seeded ${activities.length} activities`);

    // Seed Rewards
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
    console.log(`✅ Seeded ${rewards.length} rewards`);

    // Seed Scheduled Events
    const events = [
      {
        id: 'battlefield',
        nombre: 'Campo de Batalla',
        horarios: ['08:00', '12:00', '18:00', '22:00'],
        duracion_minutos: 60,
        descripcion: 'Evento PvP 8v8. Las 3 primeras partidas del día otorgan recompensas mejoradas.',
        tipo: 'pvp'
      },
      {
        id: 'haunted_carriage',
        nombre: 'Carruaje Poseído',
        horarios: ['12:00', '20:30', '22:00'],
        duracion_minutos: 30,
        descripcion: 'Escolta el carruaje hasta su destino mientras defiendes contra oleadas de enemigos.',
        tipo: 'world_event'
      },
      {
        id: 'vault_raid',
        nombre: 'Asalto a la Cámara',
        horarios: ['12:00', '19:00'],
        duracion_minutos: 30,
        descripcion: 'Evento de facción. Asalta la cámara de la facción contraria para obtener recompensas.',
        tipo: 'faction'
      },
      {
        id: 'shadow_assembly',
        nombre: 'Reunión de las Sombras',
        horarios: ['19:00'],
        duracion_minutos: 60,
        descripcion: 'Evento exclusivo de Sombras. Coordina con tu clan para actividades especiales.',
        tipo: 'faction'
      },
      {
        id: 'ancient_arena',
        nombre: 'Arena Ancestral',
        horarios: ['21:30'],
        duracion_minutos: 30,
        descripcion: 'Combate PvP en la arena ancestral. Demuestra tu habilidad contra otros jugadores.',
        tipo: 'pvp'
      }
    ];

    for (const event of events) {
      await client.query(
        `INSERT INTO scheduled_events (id, nombre, horarios, duracion_minutos, descripcion, tipo) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`,
        [event.id, event.nombre, event.horarios, event.duracion_minutos, event.descripcion, event.tipo]
      );
    }
    console.log(`✅ Seeded ${events.length} scheduled events`);

    // Seed Event Rewards
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
    console.log(`✅ Seeded ${eventRewards.length} event rewards`);

    // Seed Activity Rewards (principales actividades con recompensas conocidas)
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
    console.log(`✅ Seeded ${activityRewards.length} activity rewards`);
    console.log(`✅ Seeded ${events.length} scheduled events`);

    console.log('🎉 Base data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding base data:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Inicializa la base de datos: verifica tablas y datos, y los restaura si es necesario
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔍 Checking database status...');
    
    // Verificar si las tablas existen
    const tablesExist = await checkDatabaseTables();
    
    if (!tablesExist) {
      console.log('⚠️  Tables not found. Creating database schema...');
      await createTables();
    } else {
      console.log('✅ All tables exist');
    }
    
    // Verificar si hay datos base
    const hasData = await checkBaseData();
    
    if (!hasData) {
      console.log('⚠️  Base data not found. Seeding database...');
      await seedBaseData();
    } else {
      console.log('✅ Base data exists');
    }
    
    console.log('✅ Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
