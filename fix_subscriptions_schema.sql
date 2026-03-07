-- Migration to fix subscriptions table schema
-- This adds the missing columns and aligns naming with the application

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS promotion_id UUID,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'نشط',
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0;

-- Optional: If you had a 'total' column, you might want to migrate data and drop it
-- UPDATE public.subscriptions SET total_amount = total WHERE total_amount = 0 AND total IS NOT NULL;
-- ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS total;