import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../index';
import { Location } from '../types';

const router = Router();

// Get all locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY priority DESC, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get location by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM locations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create location
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      latitude,
      longitude,
      category,
      subcategory,
      priority,
      tags = [],
    } = req.body;

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO locations (id, name, description, latitude, longitude, category, subcategory, priority, tags, visited)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
       RETURNING *`,
      [id, name, description, latitude, longitude, category, subcategory, priority, JSON.stringify(tags)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update location
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, visited, priority, tags } = req.body;
    const result = await pool.query(
      `UPDATE locations SET name = COALESCE($1, name), description = COALESCE($2, description),
       visited = COALESCE($3, visited), priority = COALESCE($4, priority),
       tags = COALESCE($5, tags), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, description, visited, priority, tags ? JSON.stringify(tags) : null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete location
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
