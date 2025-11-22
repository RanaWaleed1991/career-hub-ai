import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { courseDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';
import { validate } from '../middleware/validate.js';
import {
  createCourseSchema,
  updateCourseSchema,
  deleteCourseSchema,
  courseTypeSchema,
  enrollCourseSchema,
} from '../validators/schemas.js';
import { sanitizeDescription, sanitizePlainText, sanitizeUrl } from '../utils/sanitization.js';

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
router.get('/type/:type', courseTypeSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { type } = req.params;

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
router.post('/admin', authMiddleware, adminMiddleware, createCourseSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Sanitize inputs to prevent XSS attacks
    const sanitizedData: any = {
      title: sanitizePlainText(title),
      provider: sanitizePlainText(provider),
      description: sanitizeDescription(description), // Allows safe HTML formatting
      video_url: sanitizeUrl(video_url),
      type,
      level,
    };

    // Optional fields
    if (thumbnail_url) sanitizedData.thumbnail_url = sanitizeUrl(thumbnail_url);
    if (duration) sanitizedData.duration = sanitizePlainText(duration);
    if (category) sanitizedData.category = sanitizePlainText(category);
    if (affiliate_link) sanitizedData.affiliate_link = sanitizeUrl(affiliate_link);

    const course = await courseDb.create(sanitizedData);

    console.log(`✅ Course created: "${sanitizedData.title}" by admin ${req.user?.email}`);

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
router.put('/admin/:id', authMiddleware, adminMiddleware, updateCourseSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Sanitize inputs to prevent XSS attacks
    const sanitizedData: any = {};
    if (title) sanitizedData.title = sanitizePlainText(title);
    if (provider) sanitizedData.provider = sanitizePlainText(provider);
    if (description) sanitizedData.description = sanitizeDescription(description);
    if (video_url) sanitizedData.video_url = sanitizeUrl(video_url);
    if (type) sanitizedData.type = type;
    if (status) sanitizedData.status = status;
    if (thumbnail_url) sanitizedData.thumbnail_url = sanitizeUrl(thumbnail_url);
    if (duration) sanitizedData.duration = sanitizePlainText(duration);
    if (level) sanitizedData.level = level;
    if (category) sanitizedData.category = sanitizePlainText(category);
    if (affiliate_link) sanitizedData.affiliate_link = sanitizeUrl(affiliate_link);
    if (is_featured !== undefined) sanitizedData.is_featured = is_featured;

    const course = await courseDb.update(id, sanitizedData);

    console.log(`✅ Course updated: ID ${id} by admin ${req.user?.email}`);

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
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteCourseSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;

    console.log(`🗑️ Admin ${req.user?.email} attempting to delete course ID: ${id}`);

    await courseDb.delete(id);

    console.log(`✅ Course ${id} deleted successfully by admin ${req.user?.email}`);

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting course:', error);
    const message = handleDatabaseError(error, 'delete course');
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/courses/enroll
 * Track course enrollment (requires authentication)
 */
router.post('/enroll', authMiddleware, enrollCourseSchema, validate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
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
