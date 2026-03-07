
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://acjkrffhfnqrrinvlyzb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function debugActivities() {
    console.log("Checking activities table...")
    const { data, error } = await supabase.from('activities').select('*')
    if (error) {
        console.error("Error fetching activities:", error)
    } else {
        console.log(`Found ${data.length} total activities in DB.`)
        data.forEach(a => {
            console.log(`- ID: ${a.id}, Name: ${a.name}, ClubID: ${a.club_id}`)
        })
    }

    console.log("\nChecking clubs table...")
    const { data: clubs, error: clubError } = await supabase.from('clubs').select('*')
    if (clubError) {
        console.error("Error fetching clubs:", clubError)
    } else {
        console.log(`Found ${clubs.length} clubs.`)
        clubs.forEach(c => {
            console.log(`- ID: ${c.id}, Name: ${c.name}`)
        })
    }
}

debugActivities()
