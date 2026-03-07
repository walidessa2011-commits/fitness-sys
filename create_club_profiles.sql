-- Create club_profiles table for organization/club identity data
CREATE TABLE IF NOT EXISTS club_profiles (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    club_id UUID REFERENCES clubs (id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL DEFAULT '',
    name_en TEXT DEFAULT '',
    city TEXT DEFAULT '',
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    fax TEXT DEFAULT '',
    website TEXT DEFAULT '',
    email TEXT DEFAULT '',
    tax_number TEXT DEFAULT '',
    commercial_registration TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    municipality_license TEXT DEFAULT '',
    postal_code TEXT DEFAULT '',
    additional_info TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (club_id)
);

ALTER TABLE club_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club_profiles_select" ON club_profiles FOR
SELECT USING (true);

CREATE POLICY "club_profiles_insert" ON club_profiles FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "club_profiles_update" ON club_profiles FOR
UPDATE USING (true);

CREATE POLICY "club_profiles_delete" ON club_profiles FOR DELETE USING (true);