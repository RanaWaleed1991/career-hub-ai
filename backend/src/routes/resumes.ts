import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { resumeDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/resumes
 * Create a new resume
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { resumeData } = req.body;

    if (!resumeData) {
      res.status(400).json({ error: 'Resume data is required' });
      return;
    }

    const resume = await resumeDb.create(req.user.id, resumeData);
    res.status(201).json({ resume });
  } catch (error) {
    const message = handleDatabaseError(error, 'create resume');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const resumes = await resumeDb.getAll(req.user.id);
    res.status(200).json({ resumes });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch resumes');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/resumes/active
 * Get the active resume for the authenticated user
 */
router.get('/active', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const resume = await resumeDb.getActive(req.user.id);
    res.status(200).json({ resume });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch active resume');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/resumes/:id
 * Get a specific resume by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const resume = await resumeDb.getById(id, req.user.id);
    res.status(200).json({ resume });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch resume');
    res.status(404).json({ error: message });
  }
});

/**
 * PUT /api/resumes/:id
 * Update a resume
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { resumeData } = req.body;

    if (!resumeData) {
      res.status(400).json({ error: 'Resume data is required' });
      return;
    }

    const resume = await resumeDb.update(id, req.user.id, resumeData);
    res.status(200).json({ resume });
  } catch (error) {
    const message = handleDatabaseError(error, 'update resume');
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/resumes/:id/activate
 * Set a resume as active
 */
router.put('/:id/activate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const resume = await resumeDb.setActive(id, req.user.id);
    res.status(200).json({ resume });
  } catch (error) {
    const message = handleDatabaseError(error, 'activate resume');
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /api/resumes/:id
 * Delete a resume
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    await resumeDb.delete(id, req.user.id);
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'delete resume');
    res.status(500).json({ error: message });
  }
});

export default router;
