-- 1. Create DAILY_TICKET_TYPES Table
CREATE TABLE IF NOT EXISTS public.daily_ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    validity_days INTEGER DEFAULT 1,
    revenue_type_id UUID REFERENCES public.revenue_types (id) ON DELETE SET NULL,
    is_stadium_rental BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    club_id UUID REFERENCES public.clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 2. Update DAILY_TICKETS table to link to DAILY_TICKET_TYPES
ALTER TABLE public.daily_tickets
ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES public.daily_ticket_types (id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'مدفوع',
ADD COLUMN IF NOT EXISTS visit_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS revisit_count INTEGER DEFAULT 0;

-- 3. DISABLE RLS for daily_ticket_types to match project pattern
ALTER TABLE public.daily_ticket_types DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.daily_tickets DISABLE ROW LEVEL SECURITY;