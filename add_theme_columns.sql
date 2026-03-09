-- Migration to add smart theme customization columns to club_settings table
ALTER TABLE public.club_settings
ADD COLUMN IF NOT EXISTS theme_header_from TEXT,
ADD COLUMN IF NOT EXISTS theme_header_to TEXT,
ADD COLUMN IF NOT EXISTS theme_header_bg TEXT,
ADD COLUMN IF NOT EXISTS theme_table_bg TEXT,
ADD COLUMN IF NOT EXISTS theme_table_text TEXT,
ADD COLUMN IF NOT EXISTS theme_button_bg TEXT,
ADD COLUMN IF NOT EXISTS theme_button_text TEXT;