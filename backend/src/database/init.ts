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
      AND table_name IN ('users', 'activities', 'user_progress', 'scheduled_events')
    `);
    
    return result.rows.length === 4;
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
        recompensas TEXT,
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

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(completed_date);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_tipo ON activities(tipo);');

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
    
    const activitiesCount = parseInt(activitiesResult.rows[0].count);
    const eventsCount = parseInt(eventsResult.rows[0].count);
    
    return activitiesCount > 0 && eventsCount > 0;
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
        detalle: 'Actividad diaria prioritaria: Límite Abisal en grupo de 4 es lo más eficiente (aprox 4 min). También se puede farmear en Castillo de Erebban en solitario (más lento). Los enemigos sueltan gemas normales; recoge hasta 12 no vinculadas cada día. Las que dejes pasar reaparecen como vinculadas.'
      },
      {
        id: 'daily_misiones_tablero',
        nombre: 'Misiones diarias (Tablero de misiones)',
        tipo: 'diaria',
        prioridad: 'B',
        tiempo_aprox: '15–35 min (8 misiones)',
        recompensas: 'Experiencia, materiales, algunos ítems. Variante usando Esencias del Terror para garantizar drop de ítems eternos con magias eternas.',
        mejora: 'Progreso estable (XP/materiales) y acceso a equipo eterno con magias eternas para builds.',
        detalle: 'Completa al menos 8 misiones del tablero cada día para mantener el ritmo; si no juegas una jornada, las tareas pendientes se acumulan.'
      },
      {
        id: 'daily_abyssal_essence_rayek',
        nombre: 'Esencias abisales a Rayek (10 esencias)',
        tipo: 'diaria',
        prioridad: 'B+',
        tiempo_aprox: 'Pasivo durante farmeo',
        recompensas: '40 puntos de pase de batalla + esencias de monstruos.',
        mejora: 'Progreso de pase y materiales adicionales.',
        detalle: 'Al farmear en Límite Abisal o Erebban, consigue 10 esencias abisales. Al obtenerlas, entrégalas a Rayek para recibir 40 puntos del pase de batalla más esencias de monstruos. Se completa de forma pasiva mientras farmeas gemas.'
      },
      {
        id: 'daily_bestiario',
        nombre: 'Bestiario (10 esencias / \'bolitas\')',
        tipo: 'diaria',
        prioridad: 'B',
        tiempo_aprox: '5–20 min (a menudo pasivo)',
        recompensas: 'Puntos de pase de batalla + posibilidad de legendarios + recompensas varias.',
        mejora: 'Sube el Pase y puede aportar legendarios mientras haces otras actividades.',
        detalle: 'Llena el bestiario entregando 10 esencias mientras exploras el mundo abierto; avanza casi sin dedicar tiempo adicional.'
      },
      {
        id: 'daily_double_reward_check',
        nombre: 'Actividad especial con doble recompensa (revisar códice)',
        tipo: 'diaria',
        prioridad: 'A',
        tiempo_aprox: 'Variable según actividad',
        recompensas: 'Doble recompensa de la actividad seleccionada.',
        mejora: 'Maximizar eficiencia del tiempo de juego.',
        detalle: 'Revisar el códice diariamente para ver qué actividad tiene doble recompensa activa. Prioriza hacer esa actividad para maximizar ganancias. La actividad con bonus cambia diariamente.'
      },
      {
        id: 'season_pvp_battleground_3',
        nombre: 'Campo de batalla (3 primeras partidas)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '20–45 min',
        recompensas: 'Diario: recompensas potenciadas menores. Temporada: progreso a recompensas grandes: gemas normales, cimeras legendarias, piedras de reforja.',
        mejora: 'Avanza recompensas de temporada y mejora refinamiento del equipo (piedras de reforja).',
        detalle: 'Juega las 3 primeras partidas del día para progresar en las recompensas de temporada de 3 meses; es la actividad PvP más rentable.'
      },
      {
        id: 'season_pvp_torres_3',
        nombre: 'Guerra de torres (3 primeras partidas)',
        tipo: 'temporada',
        prioridad: 'B',
        tiempo_aprox: '20–45 min',
        recompensas: 'Temporada: gemas normales (menos importante que Campo de batalla).',
        mejora: 'Complementa progreso de temporada si tienes tiempo o clan activo.',
        detalle: 'Juega las primeras partidas solo si ya completaste Campo de batalla; aporta progreso extra pero con menor prioridad.'
      },
      {
        id: 'daily_horadrim_iben',
        nombre: 'Legado de los Horadrim (Santuario de Iben Fahd - primer cofre)',
        tipo: 'diaria',
        prioridad: 'C',
        tiempo_aprox: '3–10 min (manual) / pasivo con mascotas',
        recompensas: 'Materiales del Santuario (progreso de recipientes Horádrim).',
        mejora: 'Progreso lento pero permanente en estadísticas del Santuario.',
        detalle: 'Abre el primer cofre del Santuario cuando tengas unos minutos o envía mascotas; suma mejoras permanentes aunque el ritmo sea lento.'
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
        detalle: 'Asegura el cap de 63 gemas vinculadas y 63 no vinculadas antes de que termine la semana, ya sea en Límite Abisal, Castillo de Erebban o Guaridas ocultas.'
      },
      {
        id: 'weekly_elder_rift_embers',
        nombre: 'Fisura Antigua (Elder Rift) - Brasas debilitadas',
        tipo: 'semanal',
        prioridad: 'S',
        tiempo_aprox: '2 min por run / 30-90 min semanal',
        recompensas: 'Brasas debilitadas (objetos únicos) para crear cimeras legendarias con el joyero + 8 puntos del códice por run.',
        mejora: 'Progreso de resonancia (cimeras legendarias) y puntos de códice.',
        detalle: 'Corre Fisuras Antiguas para conseguir brasas debilitadas, que son objetos únicos. Con ellas puedes crear cimeras legendarias visitando al joyero. Cada run toma aprox 2 minutos y otorga 8 puntos del códice. Consigue el tope semanal para maximizar recursos.'
      },
      {
        id: 'weekly_inferlicario',
        nombre: 'Inferlicario (Helliquary) con cofradía',
        tipo: 'semanal',
        prioridad: 'A+',
        tiempo_aprox: '20–60 min',
        recompensas: 'Recompensas del sistema Helliquary (materiales y progreso) y fuente importante de cimeras/crests.',
        mejora: 'Impacta progreso permanente (resonancia y/o stats) y no se recupera si lo saltas.',
        detalle: 'Coordina con la cofradía para limpiar jefes del Inferlicario; cada run deja materiales clave y cimeras para tu resonancia.'
      },
      {
        id: 'weekly_boss_diablo',
        nombre: 'Desafío de Jefe de Diablo (1/semana)',
        tipo: 'semanal',
        prioridad: 'B',
        tiempo_aprox: '10–20 min',
        recompensas: 'Puntos de pase de batalla + recompensas varias y equipo eterno.',
        mejora: 'Útil para equiparte si estás en fase de mejora; prescindible si no.',
        detalle: 'Haz el enfrentamiento semanal contra Diablo si necesitas equipo eterno o puntos de pase; puedes saltarlo cuando el tiempo es limitado.'
      },
      {
        id: 'weekly_terror_rifts',
        nombre: 'Fisuras del terror (Terror Rifts)',
        tipo: 'semanal',
        prioridad: 'B+',
        tiempo_aprox: '3 min por run hasta conseguir 1 esencia / 20-60 min semanal',
        recompensas: 'Esencias del Terror (vendibles en mercado por platino o usables en misiones/pilares), equipo legendario con magias eternas, materiales.',
        mejora: 'Genera platino y/o te prepara para mejoras de equipo; guardar para Vientos de la Fortuna.',
        detalle: 'Corre fisuras terroríficas hasta que salga 1 esencia del terror (aprox 3 min por run). Las esencias son vendibles en el mercado por platino o usables para consumir en misiones y pilares. También dropean legendarios con magias eternas.'
      },
      {
        id: 'weekly_consume_10_terror_essence',
        nombre: 'Consumir 10 esencias del terror (semanal)',
        tipo: 'semanal',
        prioridad: 'B+',
        tiempo_aprox: '10–30 min',
        recompensas: 'Legendario garantizado excepcional (alta calidad con magias eternas) + materiales (incluye rodolita).',
        mejora: 'Sirve para actualizar equipo legendario cuando lo necesitas.',
        detalle: 'Consume 10 esencias cuando busques un legendario garantizado; si tu equipo está estable, conserva la reserva para más adelante.'
      },
      {
        id: 'monthly_oblivion_pillars',
        nombre: 'Pilares del olvido (objetivo 70/semana, recomendado 1 vez al mes)',
        tipo: 'semanal',
        prioridad: 'C',
        tiempo_aprox: '0–120 min (solo si farmeas fuerte)',
        recompensas: 'Materiales + equipo legendario, útil para sesiones de actualización.',
        mejora: 'Mejor para un \'upgrade day\' mensual, ideal con Vientos de la Fortuna.',
        detalle: 'Acumula pilares y gástalos en una sesión mensual de farmeo intenso para maximizar los bonus de Vientos de la Fortuna.'
      },
      {
        id: 'weekly_vanguard',
        nombre: 'Vanguardia (Vanguard)',
        tipo: 'semanal',
        prioridad: 'C',
        tiempo_aprox: '20–60 min',
        recompensas: 'Recompensas varias (verdes/legendarios) y premios por temporada según talismán.',
        mejora: 'Extra opcional, no core.',
        detalle: 'Participa en Vanguard solo si disfrutas la actividad o necesitas sus recompensas de temporada; es completamente opcional.'
      },
      {
        id: 'weekly_materials_rodolita6',
        nombre: 'Recolectar materiales (priorizar Rodolita x6)',
        tipo: 'semanal',
        prioridad: 'B',
        tiempo_aprox: 'Pasivo + 10–20 min si falta',
        recompensas: 'Materiales semanales; rodolita es clave.',
        mejora: 'Refinar/mejorar equipo en late.',
        detalle: 'La mayor parte de la rodolita llega de forma pasiva; si te falta para subir equipo, dedica 10–20 minutos extra a recolectarla.'
      },
      {
        id: 'weekly_call_of_destruction',
        nombre: 'Llamado de la destrucción (1/semana)',
        tipo: 'semanal',
        prioridad: 'C',
        tiempo_aprox: '~10 min',
        recompensas: 'Rodolita + posibilidad de objetos legendarios.',
        mejora: 'Pequeña ventaja para completar materiales y sumar botín.',
        detalle: 'Haz la invocación semanal para asegurar rodolita extra y algún legendario, aunque no es imprescindible.'
      },
      // ===== TEMPORADA =====
      {
        id: 'season_kion_or_shadows',
        nombre: 'Cimera de Kion (Inmortales) o Guerra de Sombras (Sombras)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '10–30 min',
        recompensas: '1 cimera legendaria (según facción)',
        mejora: 'Resonancia (progreso lineal).',
        detalle: 'Completa la actividad de facción (Inmortales o Sombras) para sumar una cimera semanal dentro de la meta F2P de 5–7 cimeras.'
      },
      {
        id: 'season_clan_towers_crests',
        nombre: 'Torres de clan (hasta 2 cimeras, a veces 3)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '20–60 min',
        recompensas: 'Hasta 2 cimeras legendarias típicamente (depende del clan/torres).',
        mejora: 'Resonancia (progreso lineal).',
        detalle: 'Participa en torres de clan cuando esté activo tu grupo; suelen otorgar 2 cimeras si la alianza mantiene las conquistas.'
      },
      {
        id: 'season_merchant_crest_platinum',
        nombre: 'Cimera del mercader (comprar con platino)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '1–2 min',
        recompensas: '1 cimera legendaria (si tienes platino).',
        mejora: 'Convierte economía en resonancia.',
        detalle: 'Reserva platino cada semana para comprar esta cimera en la tienda; es la forma más directa de convertir economía en resonancia.'
      },
      {
        id: 'season_clan_ticket_crest',
        nombre: 'Cimera de la cofradía (con ticket/moneda)',
        tipo: 'temporada',
        prioridad: 'A',
        tiempo_aprox: '5–15 min',
        recompensas: '1 cimera legendaria si cumples requisitos.',
        mejora: 'Resonancia.',
        detalle: 'Coordina con tu cofradía para intercambiar tickets o monedas y así asegurar la cimera legendaria semanal.'
      },
      {
        id: 'season_immortals_shop_crest',
        nombre: 'Cimera de inmortal (tienda especial de inmortales)',
        tipo: 'temporada',
        prioridad: 'B',
        tiempo_aprox: '2–5 min',
        recompensas: '1 cimera (solo si eres inmortal).',
        mejora: 'Resonancia.',
        detalle: 'Solo disponible si eres Inmortal; revisa la tienda especial cada semana para no dejar pasar la cimera adicional.'
      }
    ];

    for (const activity of activities) {
      await client.query(
        `INSERT INTO activities (id, nombre, tipo, prioridad, tiempo_aprox, recompensas, mejora, detalle, modo, preferencia) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         ON CONFLICT (id) DO NOTHING`,
        [activity.id, activity.nombre, activity.tipo, activity.prioridad, activity.tiempo_aprox, activity.recompensas, activity.mejora, activity.detalle, activity.modo || 'individual', activity.preferencia || null]
      );
    }
    console.log(`✅ Seeded ${activities.length} activities`);

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
        id: 'ancient_nightmare',
        nombre: 'Pesadilla Ancestral',
        horarios: ['12:00', '20:30', '22:30'],
        duracion_minutos: 30,
        descripcion: 'Jefe mundial. Aparece en zonas específicas. Recompensas: legendarios, materiales.',
        tipo: 'world_event'
      },
      {
        id: 'demonic_gates',
        nombre: 'Puertas Demoníacas',
        horarios: ['12:00', '20:30', '22:00'],
        duracion_minutos: 30,
        descripcion: 'Evento grupal. Defiende contra oleadas de demonios para obtener recompensas.',
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
