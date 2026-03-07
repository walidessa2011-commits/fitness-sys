const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://iaihaqvvrfxdtjqfuput.supabase.co', 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70');

async function check() {
    try {
        // Since we can't list tables with anon key, let's try to query information_schema.tables
        // Usually anon key has no access to information_schema, but worth a try.
        const { data, error } = await s.rpc('get_tables'); // Hope they have an RPC
        if (error) {
            console.log('RPC get_tables failed:', error.message);

            // Try common names one by one and if they exist, console log them.
            // I'll try even more common names.
            const common = ['member_subs', 'subs', 'memberships', 'member_data', 'revenue', 'payments', 'transactions', 'plans', 'offers', 'coaches', 'employees', 'staff', 'attendance_logs'];
            for (const t of common) {
                const { error: e2 } = await s.from(t).select('id', { count: 'exact', head: true });
                if (!e2) console.log(`Table exists: ${t}`);
            }
        } else {
            console.log('Tables:', data);
        }
    } catch (e) {
        console.log(e);
    }
}

check();
