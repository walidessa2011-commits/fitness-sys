-- SQL Migration for Finance Module (Revenues and Expenses)
-- Run this in the Supabase SQL Editor

-- 1. Create Revenue Types Table
CREATE TABLE IF NOT EXISTS public."revenueTypes" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Revenue Entries Table
CREATE TABLE IF NOT EXISTS public."revenueEntries" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    type_id UUID REFERENCES public."revenueTypes"(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    payment_method TEXT DEFAULT 'نقدي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Ensure Expense Tables exist with proper columns (payment_method)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenseEntries' AND column_name='payment_method') THEN
        ALTER TABLE public."expenseEntries" ADD COLUMN "payment_method" TEXT DEFAULT 'نقدي';
    END IF;
END $$;

-- Enable RLS for Revenues
ALTER TABLE public."revenueTypes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."revenueEntries" ENABLE ROW LEVEL SECURITY;

-- Policies for revenueTypes
CREATE POLICY "Enable read access for all members" ON public."revenueTypes" FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public."revenueTypes" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on club_id" ON public."revenueTypes" FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for users based on club_id" ON public."revenueTypes" FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for revenueEntries
CREATE POLICY "Enable read access for all members" ON public."revenueEntries" FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public."revenueEntries" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on club_id" ON public."revenueEntries" FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for users based on club_id" ON public."revenueEntries" FOR DELETE USING (auth.role() = 'authenticated');