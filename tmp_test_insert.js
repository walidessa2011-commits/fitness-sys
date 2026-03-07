
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iaihaqvvrfxdtjqfuput.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAdd() {
    console.log('--- Testing Supabase Insert ---');
    const member = {
        name: 'Test Member ' + Date.now(),
        phone: '0500000000',
        national_id: '1234567890',
        status: 'نشط'
    };

    const { data, error } = await supabase
        .from('members')
        .insert([member])
        .select();

    if (error) {
        console.error('❌ Insert Error:', error.message);
        console.error('Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Insert Success:', data);
    }
}

testAdd();
