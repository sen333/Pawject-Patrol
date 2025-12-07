-- Add SELECT policy for volunteer_response table
-- This allows anyone (authenticated or not) to view volunteer response counts
-- Run this in Supabase SQL Editor

-- Enable RLS on volunteer_response if not already enabled
ALTER TABLE public.volunteer_response
ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Anyone can view volunteer responses" ON public.volunteer_response;

-- Create SELECT policy - allow anyone to read volunteer responses
-- This is needed for users to see signup counts
CREATE POLICY "Anyone can view volunteer responses"
ON public.volunteer_response
FOR SELECT
USING (true);

-- Optional: Create INSERT policy if not exists
-- Users can only insert their own responses
DROP POLICY IF EXISTS "Users can insert own responses" ON public.volunteer_response;

CREATE POLICY "Users can insert own responses"
ON public.volunteer_response
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Optional: Create UPDATE policy if not exists
-- Users can only update their own responses
DROP POLICY IF EXISTS "Users can update own responses" ON public.volunteer_response;

CREATE POLICY "Users can update own responses"
ON public.volunteer_response
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
