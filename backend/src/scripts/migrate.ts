import { pool } from '../index';

async function migrate() {
  try {
    console.log('🔄 Running database migrations...');

    // Enable PostGIS
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✓ PostGIS enabled');

    // Create locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        latitude DECIMAL(9, 6) NOT NULL,
        longitude DECIMAL(9, 6) NOT NULL,
        category VARCHAR(50) NOT NULL,
        subcategory VARCHAR(50),
        visited BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 3,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ locations table created');

    // Create routes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id UUID PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        start_location_id UUID NOT NULL,
        end_location_id UUID NOT NULL,
        coordinates JSONB DEFAULT '[]',
        distance_km DECIMAL(10, 2),
        travel_time_hours DECIMAL(8, 2),
        route_type VARCHAR(50) NOT NULL,
        difficulty VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (start_location_id) REFERENCES locations(id) ON DELETE CASCADE,
        FOREIGN KEY (end_location_id) REFERENCES locations(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ routes table created');

    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY,
        location_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        note_type VARCHAR(50) NOT NULL,
        media_urls JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ notes table created');

    // Create journeys table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journeys (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        locations JSONB DEFAULT '[]',
        routes JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ journeys table created');

    // Create indices for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category);
      CREATE INDEX IF NOT EXISTS idx_locations_priority ON locations(priority);
      CREATE INDEX IF NOT EXISTS idx_routes_start_location ON routes(start_location_id);
      CREATE INDEX IF NOT EXISTS idx_routes_end_location ON routes(end_location_id);
      CREATE INDEX IF NOT EXISTS idx_notes_location ON notes(location_id);
      CREATE INDEX IF NOT EXISTS idx_journeys_status ON journeys(status);
    `);
    console.log('✓ Indices created');

    console.log('✅ Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
