import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { jobDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';

const router = express.Router();

/**
 * GET /api/jobs
 * Get all active jobs (public endpoint - no auth required)
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const jobs = await jobDb.getActive();
    res.status(200).json({ jobs });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch jobs');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/jobs/category/:category
 * Get jobs by category (public endpoint)
 */
router.get('/category/:category', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { category } = req.params;

    // Validate category
    const validCategories = ['tech', 'accounting', 'casual'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const jobs = await jobDb.getByCategory(category);
    res.status(200).json({ jobs });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch jobs by category');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/jobs/admin/all
 * Get all jobs including inactive (admin only)
 */
router.get('/admin/all', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const jobs = await jobDb.getAll();
    res.status(200).json({ jobs });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch all jobs');
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/jobs/admin
 * Create a new job (admin only)
 */
router.post('/admin', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { title, company, location, description, category } = req.body;

    // Validation
    if (!title || !company || !location || !description || !category) {
      res.status(400).json({ error: 'All fields are required: title, company, location, description, category' });
      return;
    }

    // Validate category
    const validCategories = ['tech', 'accounting', 'casual'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: 'Invalid category. Must be: tech, accounting, or casual' });
      return;
    }

    const job = await jobDb.create({
      title,
      company,
      location,
      description,
      category,
    });

    res.status(201).json({ job });
  } catch (error) {
    const message = handleDatabaseError(error, 'create job');
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/jobs/admin/:id
 * Update a job (admin only)
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;
    const { title, company, location, description, category, status } = req.body;

    // Validate category if provided
    if (category) {
      const validCategories = ['tech', 'accounting', 'casual'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ error: 'Invalid category. Must be: tech, accounting, or casual' });
        return;
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: active or inactive' });
        return;
      }
    }

    const job = await jobDb.update(id, {
      title,
      company,
      location,
      description,
      category,
      status,
    });

    res.status(200).json({ job });
  } catch (error) {
    const message = handleDatabaseError(error, 'update job');
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /api/jobs/admin/:id
 * Delete a job (admin only)
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;

    await jobDb.delete(id);

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'delete job');
    res.status(500).json({ error: message });
  }
});

export default router;
