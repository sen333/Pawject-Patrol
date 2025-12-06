-- Add DELETE policy for volunteer_response table
-- This allows users to delete (leave) their own volunteer responses
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can delete own responses" ON public.volunteer_response;

-- Create DELETE policy
CREATE POLICY "Users can delete own responses"
ON public.volunteer_response
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
