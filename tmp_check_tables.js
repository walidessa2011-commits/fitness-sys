
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iaihaqvvrfxdtjqfuput.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
    const tables = ['members', 'subscriptions', 'subscription_prices', 'activities', 'subscription_types', 'employees'];

    console.log('--- Checking Supabase Tables ---');
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ Table "${table}": Error - ${error.message} (Code: ${error.code})`);
            } else {
                console.log(`✅ Table "${table}": Exists (Count: ${count})`);
            }
        } catch (e) {
            console.log(`❌ Table "${table}": Exception - ${e.message}`);
        }
    }
}

checkTables();
