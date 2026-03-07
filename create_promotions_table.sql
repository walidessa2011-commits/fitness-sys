-- Migration to create promotions table
-- This allows clubs to manage discount offers and seasonal packages

CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    price_id UUID REFERENCES public.subscription_prices (id),
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    extra_days INTEGER DEFAULT 0,
    accept_pause BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'نشط',
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Disable RLS to match the project pattern
ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;