-- SQL: volunteer_call RLS policies and helpful indexes
-- Run this in Supabase SQL editor (adjust admin checks to match your admin table/claim)

-- 1) Row Level Security and policies for `volunteer_call`
-- Note: `admin_id` is assumed to already exist and be a FK to public.admin(admin_id).
-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.volunteer_call
ENABLE ROW LEVEL SECURITY;

-- 2) Public SELECT (anyone can read volunteer calls)
CREATE POLICY "Allow public select volunteer_call"
ON public.volunteer_call
FOR SELECT
USING ( true );

-- 3) INSERT: only an authenticated admin may insert and admin_id must equal auth.uid()
CREATE POLICY "Allow admins to insert volunteer_call"
ON public.volunteer_call
FOR INSERT
TO authenticated
WITH CHECK (
  -- The inserted admin_id must reference a row in public.admin whose auth_id
  -- matches the calling user's auth.uid(). This allows your admin table to use
  -- a separate PK (`admin_id`) while mapping to the auth user via `auth_id`.
  EXISTS (
    SELECT 1 FROM public.admin a WHERE a.admin_id = admin_id AND a.auth_id = auth.uid()
  )
);

-- 4) UPDATE: only the creating admin may update their call (and must preserve admin_id)
CREATE POLICY "Allow admins to update volunteer_call"
ON public.volunteer_call
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin a WHERE a.admin_id = admin_id AND a.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin a WHERE a.admin_id = admin_id AND a.auth_id = auth.uid()
  )
);

-- 5) DELETE: only the creating admin may delete their call
CREATE POLICY "Allow admins to delete volunteer_call"
ON public.volunteer_call
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin a WHERE a.admin_id = admin_id AND a.auth_id = auth.uid()
  )
);

-- 7) Optional: Admin override policy (adjust to your admin representation)
--    Example assumes a table `public.admins(user_id uuid)` exists. Change the EXISTS subquery
--    to match your `profiles` table or JWT claim (e.g. current_setting('jwt.claims.role', true) = 'admin').
-- 6) Optional admin override: allow rows managed by any admin listed in `public.admin`
CREATE POLICY "Allow admins to manage volunteer_call"
ON public.volunteer_call
FOR ALL
TO authenticated
USING (
  -- Treat anyone with a row in public.admin (matched by auth_id) as an admin
  EXISTS (
    SELECT 1 FROM public.admin a WHERE a.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin a WHERE a.auth_id = auth.uid()
  )
);

-- 8) Helpful indexes for queries
CREATE INDEX IF NOT EXISTS idx_volunteer_call_starttime ON public.volunteer_call (call_starttime);
CREATE INDEX IF NOT EXISTS idx_volunteer_call_id ON public.volunteer_call (call_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_call_status ON public.volunteer_call (call_status);

-- 9) Notes:
-- - If you don't have an `admins` table, either create one (and populate it with admin user_ids),
--   or adjust the admin policy to use your existing admin representation (profiles.is_admin boolean
--   or a JWT claim).
-- - To allow server-side inserts from a trusted backend, use a Supabase service-key on the server
--   (service key bypasses RLS).
-- - If you prefer to set created_by server-side rather than from the client, create a server
--   function that inserts rows using the service role or run inserts from a trusted server action.

-- 10) Optional: Sample `admins` table (run only if you want to manage admins via DB)
-- CREATE TABLE IF NOT EXISTS public.admins (user_id uuid PRIMARY KEY, added_at timestamptz DEFAULT now());

-- End of file
