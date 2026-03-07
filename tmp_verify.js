const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://iaihaqvvrfxdtjqfuput.supabase.co', 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70');

async function check() {
    const t = 'member_subs';
    const { error } = await s.from(t).select('id', { count: 'exact', head: true });
    if (error) {
        console.log(`${t} error: ${error.message} (code: ${error.code})`);
    } else {
        console.log(`${t} exists!`);
    }
}
check();
