-- Migration to add missing financial tables and fix column naming
-- This aligns the database schema with the application's finance modules

-- 1. Create REVENUE_TYPES Table
CREATE TABLE IF NOT EXISTS public.revenue_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 2. Create REVENUE_ENTRIES Table
CREATE TABLE IF NOT EXISTS public.revenue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    type_id UUID REFERENCES public.revenue_types (id),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    note TEXT,
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 3. Create EXPENSE_TYPES Table
CREATE TABLE IF NOT EXISTS public.expense_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 4. Create EXPENSE_ENTRIES Table
CREATE TABLE IF NOT EXISTS public.expense_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    type_id UUID REFERENCES public.expense_types (id),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    note TEXT,
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Disable RLS for these tables to match the project pattern
ALTER TABLE public.revenue_types DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.revenue_entries DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.expense_types DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.expense_entries DISABLE ROW LEVEL SECURITY;