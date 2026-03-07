
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iaihaqvvrfxdtjqfuput.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zEuK5TTThYRwXh2-NNrN_Q_5bLBjh70';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log('--- Testing Member Insert ---');

    // Simulate what AddMemberModal is doing
    const item = {
        name: 'Test Member',
        national_id: '1234456743',
        phone: '05000000',
        email: '',
        address: '',
        gender: 'ذكر',
        nationality: 'سعودي',
        birth_date: null,
        blood_type: '',
        medical_id: '',
        vip: false,
        phone2: '',
        employer: '',
        job_title: '',
        sales_rep: '',   // <--- This is likely the problem!!
        marketing_source: 'انستجرام',
        weight: '',
        height: '',
        chronic_diseases: '',
        medications: '',
        health_consent: false,
        goals: [],
        notes: '',
        status: 'نشط',
        membership_number: '1234',
        club_id: 'default'
    };

    const { data, error } = await supabase.from('members').insert([item]).select();

    if (error) {
        console.error('❌ Insert Error:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        console.error('Code:', error.code);
    } else {
        console.log('✅ Insert Success:', data);
    }
}

testInsert();
