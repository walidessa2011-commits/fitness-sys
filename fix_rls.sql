-- SQL Migration to fix RLS policies for Club Admins
-- This script disables RLS or updates policies to allow access via the 'anon' role used by the app

-- 1. Disable RLS for tables that were incorrectly restricted to 'authenticated' role
-- Since the app uses its own logic to filter by club_id and is accessed via the 'anon' key,
-- we follow the original project pattern of disabling RLS for simplicity.

ALTER TABLE IF EXISTS public.halls DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.promotions DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public."revenueTypes" DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public."revenueEntries" DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public."expenseTypes" DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public."expenseEntries" DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.attendance DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.access_devices DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.subscription_prices DISABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.subscription_types DISABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies that might conflict
DROP POLICY IF EXISTS "Enable read access for all members" ON public.halls;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.halls;

DROP POLICY IF EXISTS "Enable update for users based on club_id" ON public.halls;

DROP POLICY IF EXISTS "Enable delete for users based on club_id" ON public.halls;

DROP POLICY IF EXISTS "Enable read access for all members" ON public.promotions;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.promotions;

DROP POLICY IF EXISTS "Enable update for users based on club_id" ON public.promotions;

DROP POLICY IF EXISTS "Enable delete for users based on club_id" ON public.promotions;

DROP POLICY IF EXISTS "Enable read access for all members" ON public."revenueTypes";

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public."revenueTypes";

DROP POLICY IF EXISTS "Enable update for users based on club_id" ON public."revenueTypes";

DROP POLICY IF EXISTS "Enable delete for users based on club_id" ON public."revenueTypes";

DROP POLICY IF EXISTS "Enable read access for all members" ON public."revenueEntries";

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public."revenueEntries";

DROP POLICY IF EXISTS "Enable update for users based on club_id" ON public."revenueEntries";

DROP POLICY IF EXISTS "Enable delete for users based on club_id" ON public."revenueEntries";

-- 3. If you prefer to KEEP RLS enabled, run the following instead (optional/alternative):
/*
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON public.halls FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON public.promotions FOR ALL USING (true) WITH CHECK (true);
*/

-- NOTE: The app already ensures data isolation in src/lib/supabase.ts by adding:
-- query = query.eq('club_id', currentClubId)
-- to all SELECT queries and forcing club_id on all INSERT/UPDATE operations.