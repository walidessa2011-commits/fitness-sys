
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://acjkrffhfnqrrinvlyzb.supabase.co';
const supabaseKey = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    try {
        // Try to select one row
        const { data: row, error: rowError } = await supabase.from('subscription_prices').select('*').limit(1);
        if (rowError) {
            console.error('Error fetching row:', rowError.message);
        } else {
            console.log('Columns in subscription_prices:', row && row.length > 0 ? Object.keys(row[0]) : 'No data, columns unknown');
        }
    } catch (e) {
        console.error('Catch error:', e.message);
    }
}

checkColumns();
