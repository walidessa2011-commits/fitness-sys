const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://iaihaqvvrfxdtjqfuput.supabase.co', 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70');

async function check() {
    const tables = ['member_subs', 'subs', 'memberships', 'members', 'users', 'clubs'];
    for (const t of tables) {
        const { data, error } = await s.from(t).select('*').limit(1);
        if (error) {
            console.log(`${t} error: ${error.message}`);
        } else {
            console.log(`${t} has ${data.length} sample rows`);
        }
    }
}
check();
