-- Migration to ensure attendance table exists and has necessary columns
-- This script aligns the database with the attendance module's requirements

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    member_id UUID NOT NULL,
    subscription_id TEXT,
    member_name TEXT,
    plan_name TEXT,
    hall_id UUID REFERENCES public.halls (id) ON DELETE SET NULL,
    type TEXT, -- 'عضو' or 'موظف'
    club_id UUID REFERENCES public.clubs (id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT NOT NULL,
    day_of_week TEXT,
    registered_by TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Disable RLS to allow direct access from the app logic
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;

-- If columns are missing in an existing table, ensure they are added
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS member_name TEXT,
ADD COLUMN IF NOT EXISTS plan_name TEXT,
ADD COLUMN IF NOT EXISTS registered_by TEXT,
ADD COLUMN IF NOT EXISTS day_of_week TEXT,
ADD COLUMN IF NOT EXISTS type TEXT;