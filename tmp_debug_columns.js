
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://acjkrffhfnqrrinvlyzb.supabase.co';
const supabaseKey = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase.from('expenseEntries').select('*').limit(1);
    if (error) console.log('Error:', error.message);
    else if (data.length > 0) console.log('Columns:', Object.keys(data[0]));
    else {
        // Try to get metadata
        console.log('No data in expenseEntries, cannot infer columns from data.');
    }
}
checkColumns();
