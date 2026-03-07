-- Create the `access_periods` table
CREATE TABLE IF NOT EXISTS public.access_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days JSONB NOT NULL DEFAULT '["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]',
    is_active BOOLEAN DEFAULT true,
    club_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.access_periods ENABLE ROW LEVEL SECURITY;

-- Create policies (modify based on your exact app permissions)
CREATE POLICY "Enable read access for all users" ON public.access_periods FOR
SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.access_periods FOR
INSERT
WITH
    CHECK (
        auth.role () = 'authenticated'
    );

CREATE POLICY "Enable update for authenticated users" ON public.access_periods FOR
UPDATE USING (
    auth.role () = 'authenticated'
);

CREATE POLICY "Enable delete for authenticated users" ON public.access_periods FOR DELETE USING (
    auth.role () = 'authenticated'
);