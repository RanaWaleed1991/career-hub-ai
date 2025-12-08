import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { blogDb, ensureDatabaseConfigured, handleDatabaseError } from '../services/database.js';
import { sanitizeDescription, sanitizePlainText, sanitizeUrl } from '../utils/sanitization.js';
import { clearCache } from '../middleware/cache.js';

const router = express.Router();

/**
 * GET /api/blogs
 * Get all published blogs (public endpoint - no auth required)
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { category, tag, search, limit = '10', offset = '0' } = req.query;

    const result = await blogDb.getPublished({
      category: category as string | undefined,
      tag: tag as string | undefined,
      search: search as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    res.status(200).json({
      blogs: result.blogs,
      total: result.total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch blogs');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/blogs/:slug
 * Get a single blog by slug (public endpoint)
 */
router.get('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { slug } = req.params;

    const blog = await blogDb.getBySlug(slug);

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    // Increment view count
    await blogDb.incrementViewCount(blog.id, blog.view_count || 0);

    res.status(200).json({ blog });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch blog');
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/blogs/admin/all
 * Get all blogs including drafts (admin only)
 */
router.get('/admin/all', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const blogs = await blogDb.getAll();

    res.status(200).json({ blogs });
  } catch (error) {
    const message = handleDatabaseError(error, 'fetch all blogs');
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/blogs/admin
 * Create a new blog (admin only)
 */
router.post('/admin', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const {
      title,
      slug,
      content,
      excerpt,
      author,
      category,
      tags,
      featured_image,
      status,
      published_date,
      meta_title,
      meta_description,
    } = req.body;

    // Validation
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    // Auto-generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      // Simple slug generation: lowercase and replace spaces with hyphens
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Calculate reading time (simple: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const reading_time_minutes = Math.max(1, Math.ceil(wordCount / 200));

    // Sanitize inputs
    const sanitizedData: any = {
      title: sanitizePlainText(title),
      slug: finalSlug,
      content: sanitizeDescription(content), // Allows safe HTML formatting
      excerpt: excerpt ? sanitizePlainText(excerpt) : null,
      author: author ? sanitizePlainText(author) : 'Career Hub AI Team',
      category: category ? sanitizePlainText(category) : null,
      tags: tags || [],
      featured_image: featured_image ? sanitizeUrl(featured_image) : null,
      status: status || 'draft',
      published_date: published_date || (status === 'published' ? new Date().toISOString() : null),
      meta_title: meta_title ? sanitizePlainText(meta_title) : sanitizePlainText(title),
      meta_description: meta_description ? sanitizePlainText(meta_description) : (excerpt ? sanitizePlainText(excerpt) : null),
      reading_time_minutes,
    };

    const blog = await blogDb.create(sanitizedData);

    console.log(`✅ Blog created: "${sanitizedData.title}" by admin ${req.user?.email}`);

    // Clear blogs cache to ensure fresh data
    clearCache('courses'); // Reusing courses cache for now

    res.status(201).json({ blog });
  } catch (error: any) {
    // Handle duplicate slug error
    if (error.code === '23505') {
      res.status(409).json({ error: 'A blog with this slug already exists' });
      return;
    }
    const message = handleDatabaseError(error, 'create blog');
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/blogs/admin/:id
 * Update a blog (admin only)
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      author,
      category,
      tags,
      featured_image,
      status,
      published_date,
      meta_title,
      meta_description,
    } = req.body;

    // Sanitize inputs
    const sanitizedData: any = {};
    if (title) sanitizedData.title = sanitizePlainText(title);
    if (slug) sanitizedData.slug = slug;
    if (content) {
      sanitizedData.content = sanitizeDescription(content);

      // Recalculate reading time if content changed
      const wordCount = content.split(/\s+/).length;
      sanitizedData.reading_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (excerpt !== undefined) sanitizedData.excerpt = excerpt ? sanitizePlainText(excerpt) : null;
    if (author) sanitizedData.author = sanitizePlainText(author);
    if (category !== undefined) sanitizedData.category = category ? sanitizePlainText(category) : null;
    if (tags !== undefined) sanitizedData.tags = tags;
    if (featured_image !== undefined) sanitizedData.featured_image = featured_image ? sanitizeUrl(featured_image) : null;
    if (status) {
      sanitizedData.status = status;
      // Set published_date when publishing for first time
      if (status === 'published' && !published_date) {
        sanitizedData.published_date = new Date().toISOString();
      }
    }
    if (published_date !== undefined) sanitizedData.published_date = published_date;
    if (meta_title) sanitizedData.meta_title = sanitizePlainText(meta_title);
    if (meta_description) sanitizedData.meta_description = sanitizePlainText(meta_description);

    const blog = await blogDb.update(id, sanitizedData);

    console.log(`✅ Blog updated: ID ${id} by admin ${req.user?.email}`);

    // Clear blogs cache
    clearCache('courses');

    res.status(200).json({ blog });
  } catch (error: any) {
    // Handle duplicate slug error
    if (error.code === '23505') {
      res.status(409).json({ error: 'A blog with this slug already exists' });
      return;
    }
    const message = handleDatabaseError(error, 'update blog');
    res.status(500).json({ error: message });
  }
});

/**
 * DELETE /api/blogs/admin/:id
 * Delete a blog (admin only)
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!ensureDatabaseConfigured(res)) return;

    const { id } = req.params;

    console.log(`🗑️ Admin ${req.user?.email} attempting to delete blog ID: ${id}`);

    await blogDb.delete(id);

    console.log(`✅ Blog ${id} deleted successfully by admin ${req.user?.email}`);

    // Clear blogs cache
    clearCache('courses');

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    const message = handleDatabaseError(error, 'delete blog');
    res.status(500).json({ error: message });
  }
});

export default router;
