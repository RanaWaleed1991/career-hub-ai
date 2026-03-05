-- ============================================================================
-- MIGRATION 010: Create expert_reviews table
-- ============================================================================
-- Supports the "Expert Resume Review" feature — a one-time $89 purchase
-- that includes professional human resume review/rewrite + 1 month Premium.
-- ============================================================================

-- Table: expert_reviews
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status flow: pending_submission → submitted → in_review →
  --   questionnaire_sent → questionnaire_completed → revision_in_progress → completed
  status TEXT NOT NULL DEFAULT 'pending_submission'
    CHECK (status IN (
      'pending_submission',
      'submitted',
      'in_review',
      'questionnaire_sent',
      'questionnaire_completed',
      'revision_in_progress',
      'completed'
    )),

  -- Payment
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- in cents (8900 = $89.00)
  paid_at TIMESTAMPTZ,

  -- Resume submission
  original_resume_url TEXT,
  original_resume_filename TEXT,
  submitted_at TIMESTAMPTZ,

  -- Questionnaire (expert asks, user answers)
  questionnaire JSONB,           -- [{question: string, type: 'text'|'textarea'}]
  questionnaire_answers JSONB,   -- [{question: string, answer: string}]
  questionnaire_sent_at TIMESTAMPTZ,
  questionnaire_completed_at TIMESTAMPTZ,

  -- Delivery
  rewritten_resume_url TEXT,
  rewritten_resume_filename TEXT,
  completed_at TIMESTAMPTZ,

  -- Admin notes (internal, never shown to user)
  admin_notes TEXT,

  -- User contact info snapshot (for admin convenience)
  user_email TEXT,
  user_name TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expert_reviews_user_id ON public.expert_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_status ON public.expert_reviews(status);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_created_at ON public.expert_reviews(created_at);

-- RLS
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expert reviews"
  ON public.expert_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own expert reviews"
  ON public.expert_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_expert_reviews_updated_at
  BEFORE UPDATE ON public.expert_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for expert review files (original + rewritten resumes)
-- NOTE: Run this in Supabase Dashboard > Storage > New Bucket:
--   Name: expert-reviews
--   Public: false (private bucket)
--   File size limit: 10MB
--   Allowed MIME types: application/pdf

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

SELECT '✅ Migration 010 complete: expert_reviews table created' as status;
