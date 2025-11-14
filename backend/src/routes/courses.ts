import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { courseDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';

const router = express.Router();

/**
 * GET /api/courses
 * Get all published courses (public endpoint - no auth required)
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const courses = await courseDb.getPublished();
    res.status(200).json({ courses });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch courses');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/courses/type/:type
 * Get courses by type (public endpoint)
 */
router.get('/type/:type', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { type } = req.params;

    // Validate type
    const validTypes = ['free', 'paid'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid type' });
      return;
    }

    const courses = await courseDb.getByType(type);
    res.status(200).json({ courses });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch courses by type');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/courses/admin/all
 * Get all courses including drafts (admin only)
 */
router.get('/admin/all', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const courses = await courseDb.getAll();
    res.status(200).json({ courses });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch all courses');
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/courses/admin
 * Create a new course (admin only)
 */
router.post('/admin', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { title, provider, description, link, type } = req.body;

    // Validation
    if (!title || !provider || !description || !link || !type) {
      res.status(400).json({ error: 'All fields are required: title, provider, description, link, type' });
      return;
    }

    // Validate type
    const validTypes = ['free', 'paid'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid type. Must be: free or paid' });
      return;
    }

    // Validate link format
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(link)) {
      res.status(400).json({ error: 'Invalid URL format. Link must start with http:// or https://' });
      return;
    }

    const course = await courseDb.create({
      title,
      provider,
      description,
      link,
      type,
    });

    res.status(201).json({ course });
  } catch (error) {
    const message = handleDatabaseError(error, 'create course');
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/courses/admin/:id
 * Update a course (admin only)
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;
    const { title, provider, description, link, type, status } = req.body;

    // Validate type if provided
    if (type) {
      const validTypes = ['free', 'paid'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ error: 'Invalid type. Must be: free or paid' });
        return;
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['draft', 'published'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: draft or published' });
        return;
      }
    }

    // Validate link format if provided
    if (link) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(link)) {
        res.status(400).json({ error: 'Invalid URL format. Link must start with http:// or https://' });
        return;
      }
    }

    const course = await courseDb.update(id, {
      title,
      provider,
      description,
      link,
      type,
      status,
    });

    res.status(200).json({ course });
  } catch (error) {
    const message = handleDatabaseError(error, 'update course');
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /api/courses/admin/:id
 * Delete a course (admin only)
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;

    await courseDb.delete(id);

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'delete course');
    res.status(500).json({ error: message });
  }
});

export default router;
