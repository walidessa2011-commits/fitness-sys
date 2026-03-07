const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://iaihaqvvrfxdtjqfuput.supabase.co', 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70');

async function check() {
    const tables = ['member_subs', 'subs', 'memberships', 'member_data', 'revenue', 'payments', 'transactions', 'plans', 'offers', 'coaches', 'members', 'users', 'clubs'];
    for (const t of tables) {
        const { count, error } = await s.from(t).select('id', { count: 'exact', head: true });
        if (!error) {
            console.log(`${t}: ${count} rows`);
        } else {
            console.log(`${t}: error - ${error.message}`);
        }
    }
}
check();
