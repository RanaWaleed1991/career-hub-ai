import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { versionDb, resumeDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/versions
 * Save a new version
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { resumeId, versionData, versionName } = req.body;

    if (!resumeId || !versionData || !versionName) {
      res.status(400).json({ error: 'Resume ID, version data, and version name are required' });
      return;
    }

    const version = await versionDb.create(req.user.id, resumeId, versionData, versionName);
    res.status(201).json({ version });
  } catch (error) {
    const message = handleDatabaseError(error, 'save version');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/versions
 * Get all versions for the authenticated user
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const versions = await versionDb.getAll(req.user.id);
    res.status(200).json({ versions });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch versions');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/versions/resume/:resumeId
 * Get versions for a specific resume
 */
router.get('/resume/:resumeId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { resumeId } = req.params;
    const versions = await versionDb.getByResumeId(resumeId, req.user.id);
    res.status(200).json({ versions });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch versions');
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/versions/:id/restore
 * Restore a version (copy version data to active resume)
 */
router.post('/:id/restore', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Get the version
    const version = await versionDb.getById(id, req.user.id);

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    // Update the resume with version data
    const resume = await resumeDb.update(version.resume_id, req.user.id, version.data);
    res.status(200).json({ resume, message: 'Version restored successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'restore version');
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /api/versions/:id
 * Delete a version
 */
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    await versionDb.delete(id, req.user.id);
    res.status(200).json({ message: 'Version deleted successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'delete version');
    res.status(500).json({ error: message });
  }
});

export default router;
