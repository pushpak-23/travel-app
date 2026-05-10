import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../index';

const router = Router();

// Get all routes
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get route by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create route
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      start_location_id,
      end_location_id,
      coordinates,
      distance_km,
      travel_time_hours,
      route_type,
      difficulty,
    } = req.body;

    // Validate required fields
    if (!start_location_id || !end_location_id) {
      return res.status(400).json({ error: 'start_location_id and end_location_id are required' });
    }

    // Generate default name if not provided
    const routeName = name || `${route_type} route`;

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO routes (id, name, description, start_location_id, end_location_id, coordinates, distance_km, travel_time_hours, route_type, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, routeName, description || '', start_location_id, end_location_id, JSON.stringify(coordinates || []), distance_km || 0, travel_time_hours || 0, route_type, difficulty || 'easy']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Route creation error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update route
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      difficulty,
      route_type,
      distance_km,
      travel_time_hours,
      start_location_id,
      end_location_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE routes SET name = COALESCE($1, name), description = COALESCE($2, description),
       difficulty = COALESCE($3, difficulty), route_type = COALESCE($4, route_type),
       distance_km = COALESCE($5, distance_km), travel_time_hours = COALESCE($6, travel_time_hours),
       start_location_id = COALESCE($7, start_location_id), end_location_id = COALESCE($8, end_location_id),
       updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        name,
        description,
        difficulty,
        route_type,
        distance_km,
        travel_time_hours,
        start_location_id,
        end_location_id,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete route
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM routes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
