import express, { Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { normalizeStateName } from '../utils/state';

const router = express.Router();

// Get all locations grouped by state and itinerary
// Response: { [state]: { [itinerary_name]: Location[], ungrouped: Location[] } }
router.get('/grouped', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, latitude, longitude, category, subcategory, 
              state, itinerary_name, visited, priority, tags
       FROM locations
       ORDER BY state ASC, itinerary_name ASC, priority DESC, name ASC`
    );

    const grouped: Record<string, Record<string, any[]>> = {};

    // Group locations by state, then by itinerary
    for (const location of result.rows) {
      const state = normalizeStateName(location.state) || 'Unassigned';
      const itinerary = (location.itinerary_name || 'General').trim() || 'General';

      if (!grouped[state]) {
        grouped[state] = {};
      }
      if (!grouped[state][itinerary]) {
        grouped[state][itinerary] = [];
      }

      grouped[state][itinerary].push({
        ...location,
        tags: Array.isArray(location.tags) ? location.tags : [],
      });
    }

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching grouped locations:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get locations for a specific state
router.get('/by-state/:state', async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const normalizedState = normalizeStateName(state);
    const result = await pool.query(
      `SELECT id, name, description, latitude, longitude, category, subcategory, 
              state, itinerary_name, visited, priority, tags
       FROM locations
       WHERE LOWER(TRIM(COALESCE(state, ''))) = LOWER(TRIM($1)) OR (state IS NULL AND $1 = 'Unassigned')
       ORDER BY itinerary_name ASC, priority DESC, name ASC`,
      [normalizedState === 'Unassigned' ? null : normalizedState]
    );

    res.json(result.rows.map((loc) => ({
      ...loc,
      tags: Array.isArray(loc.tags) ? loc.tags : [],
    })));
  } catch (error) {
    console.error('Error fetching locations by state:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get locations for a specific state and itinerary
router.get('/by-state/:state/itinerary/:itinerary', async (req: Request, res: Response) => {
  try {
    const { state, itinerary } = req.params;
    const normalizedState = normalizeStateName(state);
    const result = await pool.query(
      `SELECT id, name, description, latitude, longitude, category, subcategory, 
              state, itinerary_name, visited, priority, tags
       FROM locations
       WHERE (LOWER(TRIM(COALESCE(state, ''))) = LOWER(TRIM($1)) OR (state IS NULL AND $1 = 'Unassigned'))
       AND (LOWER(TRIM(COALESCE(itinerary_name, ''))) = LOWER(TRIM($2)) OR (itinerary_name IS NULL AND $2 = 'General'))
       ORDER BY priority DESC, name ASC`,
      [normalizedState === 'Unassigned' ? null : normalizedState, itinerary === 'General' ? null : itinerary]
    );

    res.json(result.rows.map((loc) => ({
      ...loc,
      tags: Array.isArray(loc.tags) ? loc.tags : [],
    })));
  } catch (error) {
    console.error('Error fetching locations by state and itinerary:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get all unique states
router.get('/states', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT COALESCE(state, 'Unassigned') as state
       FROM locations
       ORDER BY state ASC`
    );

    const normalizedStates = Array.from(new Set(result.rows.map((row) => normalizeStateName(row.state) || 'Unassigned'))).sort();
    res.json(normalizedStates);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get all unique itineraries for a state
router.get('/states/:state/itineraries', async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const normalizedState = normalizeStateName(state);
    const result = await pool.query(
      `SELECT DISTINCT COALESCE(itinerary_name, 'General') as itinerary
       FROM locations
       WHERE LOWER(TRIM(COALESCE(state, ''))) = LOWER(TRIM($1)) OR (state IS NULL AND $1 = 'Unassigned')
       ORDER BY itinerary ASC`,
      [normalizedState === 'Unassigned' ? null : normalizedState]
    );

    res.json(result.rows.map((row) => row.itinerary));
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
