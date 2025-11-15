import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { jobDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';
import { AdzunaService } from '../services/adzunaService.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import {
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
  jobCategorySchema,
} from '../validators/schemas.js';

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
router.get('/category/:category', jobCategorySchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { category } = req.params;

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
router.post('/admin', authMiddleware, adminMiddleware, createJobSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { title, company, location, description, category } = req.body;

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
router.put('/admin/:id', authMiddleware, adminMiddleware, updateJobSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;
    const { title, company, location, description, category, status } = req.body;

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
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteJobSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
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

/**
 * POST /api/jobs/admin/sync
 * Sync jobs from Adzuna API (admin only)
 */
router.post('/admin/sync', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    // Check if Adzuna is configured
    if (!env.ADZUNA_APP_ID || !env.ADZUNA_API_KEY) {
      res.status(503).json({
        error: 'Adzuna API is not configured. Please add ADZUNA_APP_ID and ADZUNA_API_KEY to .env file.',
      });
      return;
    }

    const { limitPerCategory = 20, clearExisting = true, location } = req.body;

    // Initialize Adzuna service
    const adzunaService = new AdzunaService();

    // Optionally clear existing Adzuna jobs to prevent duplicates
    if (clearExisting) {
      await jobDb.deleteBySource('adzuna');
    }

    // Fetch jobs from Adzuna for all categories
    const { tech, accounting, casual } = await adzunaService.fetchAllCategoryJobs(limitPerCategory, location);

    // Combine all jobs
    const allJobs = [...tech, ...accounting, ...casual];

    // Bulk insert into database
    const insertedJobs = await jobDb.bulkCreate(allJobs);

    res.status(200).json({
      message: 'Jobs synced successfully from Adzuna',
      stats: {
        tech: tech.length,
        accounting: accounting.length,
        casual: casual.length,
        total: insertedJobs.length,
      },
      jobs: insertedJobs,
    });
  } catch (error: any) {
    console.error('Failed to sync jobs from Adzuna:', error);
    const message = error.message || 'Failed to sync jobs from Adzuna';
    res.status(500).json({ error: message });
  }
});

export default router;
