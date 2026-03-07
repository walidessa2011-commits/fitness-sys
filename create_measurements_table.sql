-- Create table for member measurements
CREATE TABLE IF NOT EXISTS public.member_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    member_id UUID REFERENCES public.members (id) ON DELETE CASCADE,
    weight DECIMAL(5, 2), -- kg
    height DECIMAL(5, 2), -- cm
    chest DECIMAL(5, 2),
    waist DECIMAL(5, 2),
    arms DECIMAL(5, 2),
    date DATE DEFAULT CURRENT_DATE,
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE public.member_measurements DISABLE ROW LEVEL SECURITY;