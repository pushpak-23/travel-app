import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../index';

const router = Router();

// Get all notes for a location
router.get('/location/:location_id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE location_id = $1 ORDER BY created_at DESC', [req.params.location_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get note by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create note
router.post('/', async (req: Request, res: Response) => {
  try {
    const { location_id, title, content, note_type, media_urls = [] } = req.body;

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO notes (id, location_id, title, content, note_type, media_urls)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, location_id, title, content, note_type, JSON.stringify(media_urls)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, media_urls } = req.body;
    const result = await pool.query(
      `UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content),
       media_urls = COALESCE($3, media_urls), updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, content, media_urls ? JSON.stringify(media_urls) : null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
