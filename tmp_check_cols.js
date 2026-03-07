
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iaihaqvvrfxdtjqfuput.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCols(table) {
    console.log(`--- Checking columns for ${table} ---`);
    const { data, error } = await supabase.from(table).select().limit(1);

    if (error) {
        console.log(`Error for ${table}:`, error.message);
    } else {
        console.log(`Success for ${table}:`, data);
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, trying to insert dummy row with random col names to trigger error suggestions...');
            const { error: insError } = await supabase.from(table).insert([{ something_random: 1 }]);
            console.log('Insert error hint:', insError?.message);
        }
    }
}

async function run() {
    await checkCols('members');
    await checkCols('subscriptions');
}

run();
