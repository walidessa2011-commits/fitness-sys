
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://acjkrffhfnqrrinvlyzb.supabase.co';
const supabaseKey = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase.from('subscription_prices').select('*').limit(1);
    if (error) {
        console.error('Error fetching data:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns in subscription_prices:', Object.keys(data[0]));
    } else {
        console.log('No data in subscription_prices table.');
    }
}

checkColumns();
