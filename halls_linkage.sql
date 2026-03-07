-- Link halls to activities and attendance
-- Run this in the Supabase SQL Editor

-- 1. Add hall_id to activities
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS hall_id UUID REFERENCES public.halls (id) ON DELETE SET NULL;

-- 2. Add hall_id to attendance
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS hall_id UUID REFERENCES public.halls (id) ON DELETE SET NULL;

-- 3. Enable RLS for halls (already enabled but just in case)
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;

-- 4. Policies for halls if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'halls' AND policyname = 'Enable read access for all members') THEN
        CREATE POLICY "Enable read access for all members" ON public.halls FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'halls' AND policyname = 'Enable insert for authenticated users only') THEN
        CREATE POLICY "Enable insert for authenticated users only" ON public.halls FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'halls' AND policyname = 'Enable update for users based on club_id') THEN
        CREATE POLICY "Enable update for users based on club_id" ON public.halls FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'halls' AND policyname = 'Enable delete for users based on club_id') THEN
        CREATE POLICY "Enable delete for users based on club_id" ON public.halls FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;