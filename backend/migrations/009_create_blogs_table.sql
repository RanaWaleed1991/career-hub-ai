-- Migration: Create blogs table for content marketing and SEO
-- Date: 2025-12-08
-- Description: Enables admin to create and manage blog posts for SEO and user engagement

-- =====================================================
-- Blogs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content fields
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author VARCHAR(255) NOT NULL DEFAULT 'Career Hub AI Team',

  -- Categorization
  category VARCHAR(100),
  tags TEXT[], -- Array of tags for filtering

  -- Media
  featured_image VARCHAR(500),

  -- Publishing
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_date TIMESTAMP WITH TIME ZONE,

  -- SEO fields
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Reading metrics
  reading_time_minutes INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Primary query patterns
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published_date ON blogs(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- Full-text search on title and content (PostgreSQL native)
CREATE INDEX IF NOT EXISTS idx_blogs_search ON blogs USING GIN(to_tsvector('english', title || ' ' || content));

-- Tag search using GIN index for arrays
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING GIN(tags);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published blogs only
CREATE POLICY "Published blogs are viewable by everyone" ON blogs
  FOR SELECT
  USING (status = 'published');

-- Admin insert/update/delete handled by backend service_role key (bypasses RLS)
-- No policy needed for admin operations

-- =====================================================
-- Updated_at Trigger
-- =====================================================

-- Apply auto-update trigger for updated_at column
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug(blog_title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(blog_title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate reading time based on content length
CREATE OR REPLACE FUNCTION calculate_reading_time(blog_content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  words_per_minute INTEGER := 200; -- Average reading speed
BEGIN
  -- Count words (split by whitespace)
  word_count := array_length(regexp_split_to_array(blog_content, '\s+'), 1);
  -- Calculate minutes, minimum 1 minute
  RETURN GREATEST(1, CEIL(word_count::NUMERIC / words_per_minute));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE blogs IS 'Blog posts for content marketing and SEO';
COMMENT ON COLUMN blogs.slug IS 'SEO-friendly URL slug (auto-generated from title if not provided)';
COMMENT ON COLUMN blogs.content IS 'Full blog post content (supports markdown/HTML)';
COMMENT ON COLUMN blogs.excerpt IS 'Short summary shown in blog listings';
COMMENT ON COLUMN blogs.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN blogs.meta_title IS 'SEO meta title (defaults to title if not provided)';
COMMENT ON COLUMN blogs.meta_description IS 'SEO meta description (defaults to excerpt if not provided)';
COMMENT ON COLUMN blogs.reading_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blogs.view_count IS 'Number of times blog post has been viewed';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Migration complete: blogs table created';
  RAISE NOTICE '  - Blogs table: % columns', (SELECT count(*) FROM information_schema.columns WHERE table_name = 'blogs');
  RAISE NOTICE '  - Indexes created: slug, status, category, published_date, search, tags';
  RAISE NOTICE '  - Helper functions: generate_blog_slug(), calculate_reading_time()';
END $$;
