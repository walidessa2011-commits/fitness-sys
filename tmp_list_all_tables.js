
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://acjkrffhfnqrrinvlyzb.supabase.co';
const supabaseKey = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const { data: tables, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

    if (error) {
        console.error('Error listing tables:', error.message);
        // Fallback: try to guess common tables
        const commonTables = ['revenues', 'expenses', 'finance_revenues', 'finance_expenses', 'financial_categories'];
        for (const table of commonTables) {
            const { error: tErr } = await supabase.from(table).select('id').limit(1);
            if (!tErr) console.log('Found table:', table);
        }
    } else {
        console.log('Tables:', tables.map(t => t.tablename));
    }
}

listTables();
