const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://iaihaqvvrfxdtjqfuput.supabase.co', 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70');

async function check() {
    const { data, error } = await s.from('memberships').select('*');
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Success! Count:', data.length);
    }
}
check();
