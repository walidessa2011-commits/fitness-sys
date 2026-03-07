-- Migration to add missing columns to subscription_prices table
-- This aligns the database schema with the application's expected fields

ALTER TABLE public.subscription_prices
ADD COLUMN IF NOT EXISTS subscription_name TEXT,
ADD COLUMN IF NOT EXISTS entry_period TEXT DEFAULT 'طوال اليوم',
ADD COLUMN IF NOT EXISTS revenue_type TEXT,
ADD COLUMN IF NOT EXISTS attendance_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expire_by_count BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pause_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pause_revenue_type TEXT,
ADD COLUMN IF NOT EXISTS transfer_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transfer_revenue_type TEXT,
ADD COLUMN IF NOT EXISTS activities_list JSONB DEFAULT '[]';

-- Optional: Update existing records to have a name if they don't
UPDATE public.subscription_prices
SET
    subscription_name = 'اشتراك غير مسمى'
WHERE
    subscription_name IS NULL;