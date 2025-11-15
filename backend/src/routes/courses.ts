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

    const {
      title,
      provider,
      description,
      video_url,
      type,
      thumbnail_url,
      duration,
      level,
      category,
      affiliate_link
    } = req.body;

    // Validation
    if (!title || !provider || !description || !video_url || !type) {
      res.status(400).json({ error: 'Required fields are missing: title, provider, description, video_url, type' });
      return;
    }

    // Validate type
    const validTypes = ['free', 'paid'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid type. Must be: free or paid' });
      return;
    }

    // If paid course, affiliate link is required
    if (type === 'paid' && !affiliate_link) {
      res.status(400).json({ error: 'Affiliate link is required for paid courses' });
      return;
    }

    // Validate video_url format
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(video_url)) {
      res.status(400).json({ error: 'Invalid URL format. Video URL must start with http:// or https://' });
      return;
    }

    // Validate affiliate_link format if provided
    if (affiliate_link && !urlPattern.test(affiliate_link)) {
      res.status(400).json({ error: 'Invalid URL format. Affiliate link must start with http:// or https://' });
      return;
    }

    // Validate level if provided
    if (level) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(level)) {
        res.status(400).json({ error: 'Invalid level. Must be: beginner, intermediate, or advanced' });
        return;
      }
    }

    const course = await courseDb.create({
      title,
      provider,
      description,
      video_url,
      type,
      thumbnail_url,
      duration,
      level,
      category,
      affiliate_link,
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
    const {
      title,
      provider,
      description,
      video_url,
      type,
      status,
      thumbnail_url,
      duration,
      level,
      category,
      affiliate_link,
      is_featured
    } = req.body;

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

    // Validate level if provided
    if (level) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(level)) {
        res.status(400).json({ error: 'Invalid level. Must be: beginner, intermediate, or advanced' });
        return;
      }
    }

    // Validate URL formats if provided
    const urlPattern = /^https?:\/\/.+/;
    if (video_url && !urlPattern.test(video_url)) {
      res.status(400).json({ error: 'Invalid URL format. Video URL must start with http:// or https://' });
      return;
    }
    if (affiliate_link && !urlPattern.test(affiliate_link)) {
      res.status(400).json({ error: 'Invalid URL format. Affiliate link must start with http:// or https://' });
      return;
    }

    const course = await courseDb.update(id, {
      title,
      provider,
      description,
      video_url,
      type,
      status,
      thumbnail_url,
      duration,
      level,
      category,
      affiliate_link,
      is_featured,
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

/**
 * POST /api/courses/enroll
 * Track course enrollment (requires authentication)
 */
router.post('/enroll', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!courseId) {
      res.status(400).json({ error: 'Course ID is required' });
      return;
    }

    // Increment enrollment count (simpler approach)
    await courseDb.incrementEnrollmentCount(courseId);

    res.status(200).json({ success: true, message: 'Enrollment tracked successfully' });
  } catch (error) {
    const message = handleDatabaseError(error, 'track enrollment');
    res.status(500).json({ error: message });
  }
});

export default router;
