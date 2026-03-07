-- 1. Create CLUBS Table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    logo TEXT,
    status TEXT DEFAULT 'نشط',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 2. Create ROLES Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 3. Create USERS Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    national_id TEXT UNIQUE,
    role TEXT REFERENCES roles (name),
    club_id UUID REFERENCES clubs (id),
    status TEXT DEFAULT 'enabled',
    system_expiry_date DATE,
    avatar TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 4. Create EMPLOYEES Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    job_role TEXT,
    national_id TEXT,
    salary DECIMAL(10, 2),
    club_id UUID REFERENCES clubs (id),
    status TEXT DEFAULT 'نشط',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 5. Create MEMBERS Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    membership_number TEXT UNIQUE,
    name TEXT NOT NULL,
    national_id TEXT UNIQUE,
    phone TEXT NOT NULL,
    phone2 TEXT,
    email TEXT,
    address TEXT,
    gender TEXT,
    nationality TEXT,
    birth_date DATE,
    blood_type TEXT,
    medical_id TEXT,
    vip BOOLEAN DEFAULT FALSE,
    employer TEXT,
    job_title TEXT,
    sales_rep UUID REFERENCES employees (id),
    marketing_source TEXT,
    weight TEXT,
    height TEXT,
    chronic_diseases TEXT,
    medications TEXT,
    health_consent BOOLEAN DEFAULT FALSE,
    goals JSONB DEFAULT '[]',
    notes TEXT,
    photo TEXT,
    status TEXT DEFAULT 'نشط',
    club_id UUID REFERENCES clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 6. Create ACTIVITIES Table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    status TEXT DEFAULT 'نشط',
    club_id UUID REFERENCES clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 7. Create SUBSCRIPTION_TYPES Table
CREATE TABLE IF NOT EXISTS subscription_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    status TEXT DEFAULT 'نشط',
    club_id UUID REFERENCES clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 8. Create SUBSCRIPTION_PRICES Table
CREATE TABLE IF NOT EXISTS subscription_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    activity_id UUID REFERENCES activities (id),
    type_id UUID REFERENCES subscription_types (id),
    price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'نشط',
    club_id UUID REFERENCES clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 9. Create SUBSCRIPTIONS Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    member_id UUID REFERENCES members (id),
    price_id UUID REFERENCES subscription_prices (id),
    activity_id UUID REFERENCES activities (id),
    type_id UUID REFERENCES subscription_types (id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_method TEXT,
    payment_status TEXT,
    notes TEXT,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    vat_percent DECIMAL(5, 2) DEFAULT 15,
    coach_id UUID REFERENCES employees (id),
    amount_due DECIMAL(10, 2),
    vat_amount DECIMAL(10, 2),
    total DECIMAL(10, 2),
    coupon_code TEXT,
    club_id UUID REFERENCES clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 10. Create DAILY_TICKETS Table
CREATE TABLE IF NOT EXISTS daily_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    member_name TEXT,
    phone TEXT,
    activity_id UUID REFERENCES activities (id),
    price DECIMAL(10, 2),
    payment_method TEXT,
    club_id UUID REFERENCES clubs (id),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 11. DISABLE RLS for simplicity
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;

ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

ALTER TABLE members DISABLE ROW LEVEL SECURITY;

ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

ALTER TABLE subscription_types DISABLE ROW LEVEL SECURITY;

ALTER TABLE subscription_prices DISABLE ROW LEVEL SECURITY;

ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

ALTER TABLE daily_tickets DISABLE ROW LEVEL SECURITY;

-- 12. SEED DEFAULT DATA
INSERT INTO
    clubs (id, name)
VALUES (
        '00000000-0000-0000-0000-000000000001',
        'النادي الرئيسي'
    ) ON CONFLICT DO NOTHING;

INSERT INTO
    roles (
        name,
        display_name,
        permissions
    )
VALUES (
        'super_admin',
        'مدير النظام (Owner)',
        '["all"]'
    ),
    (
        'club_admin',
        'مدير نادي (Club Manager)',
        '["view_clubs", "view_users", "manage_subscriptions"]'
    ) ON CONFLICT DO NOTHING;

INSERT INTO
    users (
        name,
        username,
        password,
        role,
        club_id
    )
VALUES (
        'المدير العام',
        'admin',
        '123',
        'super_admin',
        '00000000-0000-0000-0000-000000000001'
    ) ON CONFLICT DO NOTHING;