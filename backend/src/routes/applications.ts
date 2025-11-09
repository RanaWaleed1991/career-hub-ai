import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { applicationDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/applications
 * Create a new job application
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const applicationData = req.body;

    if (!applicationData.company || !applicationData.role) {
      res.status(400).json({ error: 'Company and role are required' });
      return;
    }

    const application = await applicationDb.create(req.user.id, applicationData);
    res.status(201).json({ application });
  } catch (error) {
    const message = handleDatabaseError(error, 'create application');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/applications
 * Get all applications for the authenticated user
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const applications = await applicationDb.getAll(req.user.id);
    res.status(200).json({ applications });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch applications');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/applications/:id
 * Get a specific application by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const application = await applicationDb.getById(id, req.user.id);
    res.status(200).json({ application });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch application');
    res.status(404).json({ error: message });
  }
});

/**
 * PUT /api/applications/:id
 * Update an application
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const applicationData = req.body;

    const application = await applicationDb.update(id, req.user.id, applicationData);
    res.status(200).json({ application });
  } catch (error) {
    const message = handleDatabaseError(error, 'update application');
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /api/applications/:id
 * Delete an application
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    await applicationDb.delete(id, req.user.id);
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'delete application');
    res.status(500).json({ error: message });
  }
});

export default router;
