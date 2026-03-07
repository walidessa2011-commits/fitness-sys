
import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://acjkrffhfnqrrinvlyzb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CLUB_ID = '96f29075-e6ad-4dcc-adf8-44b98a073dc9'

async function seedActivities() {
    const activities = [
        { name: 'كمال أجسام', status: 'نشط', club_id: CLUB_ID, description: 'تمارين القوة والحديد' },
        { name: 'كاراتيه', status: 'نشط', club_id: CLUB_ID, description: 'فنون قتالية' },
        { name: 'سباحة', status: 'نشط', club_id: CLUB_ID, description: 'تمارين مائية' },
        { name: 'زومبا', status: 'نشط', club_id: CLUB_ID, description: 'تمارين هوائية' }
    ]

    console.log(`Seeding ${activities.length} activities for club ${CLUB_ID}...`)
    const { data, error } = await supabase.from('activities').insert(activities).select()

    if (error) {
        console.error("Error seeding activities:", error.message)
    } else {
        console.log("Seeding successful!", data)
    }
}

seedActivities()
