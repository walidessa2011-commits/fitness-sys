
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iaihaqvvrfxdtjqfuput.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    const table = 'members';
    // Select everything from the table to see column names
    const { data, error } = await supabase.from(table).select('*').limit(1);

    if (error) {
        console.log(`Error inspecting ${table}:`, error.message);
    } else {
        console.log(`Data for ${table}:`, data);
        // If data is empty, we can try to guess columns by looking at the PostgREST /rest/v1/members?select=* header or just try an insert
    }
}

inspect();
