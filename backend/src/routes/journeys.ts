import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';

const router = Router();

// Get all journeys
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM journeys ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get journey by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM journeys WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journey not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create journey
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, start_date, end_date, locations = [], routes = [], status = 'planned' } = req.body;

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO journeys (id, name, description, start_date, end_date, locations, routes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, description, start_date, end_date, JSON.stringify(locations), JSON.stringify(routes), status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update journey
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, locations, routes, status, end_date } = req.body;
    const result = await pool.query(
      `UPDATE journeys SET name = COALESCE($1, name), description = COALESCE($2, description),
       locations = COALESCE($3, locations), routes = COALESCE($4, routes),
       status = COALESCE($5, status), end_date = COALESCE($6, end_date), updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [
        name,
        description,
        locations ? JSON.stringify(locations) : null,
        routes ? JSON.stringify(routes) : null,
        status,
        end_date,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journey not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete journey
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM journeys WHERE id = $1', [req.params.id]);
    res.json({ message: 'Journey deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
