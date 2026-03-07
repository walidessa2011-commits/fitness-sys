
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://acjkrffhfnqrrinvlyzb.supabase.co';
const supabaseKey = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const list = ['expenseEntries', 'expenseTypes', 'revenueEntries', 'revenueTypes'];
    for (const table of list) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`Table ${table} does NOT exist or error: ${error.message}`);
        } else {
            console.log(`Table ${table} exists!`);
        }
    }
}

checkTables();
