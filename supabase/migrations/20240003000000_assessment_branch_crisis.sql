-- Add branch and crisis_flag columns to assessment_responses
-- branch: which of the 6 emotional branches the user was routed into
-- crisis_flag: true if the user selected a crisis response during the assessment

ALTER TABLE public.assessment_responses
  ADD COLUMN IF NOT EXISTS branch      TEXT,
  ADD COLUMN IF NOT EXISTS crisis_flag BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for filtering/analytics by branch
CREATE INDEX IF NOT EXISTS idx_assessment_responses_branch
  ON public.assessment_responses (branch);

-- Index for monitoring crisis responses
CREATE INDEX IF NOT EXISTS idx_assessment_responses_crisis
  ON public.assessment_responses (crisis_flag)
  WHERE crisis_flag = TRUE;
