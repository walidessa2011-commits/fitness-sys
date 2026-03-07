
import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://acjkrffhfnqrrinvlyzb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkHalls() {
    console.log("Checking halls table structure...")
    const { data, error } = await supabase.from('halls').select('*')
    if (error) {
        console.error("Error fetching halls (might not exist):", error.message)
    } else {
        console.log(`Found ${data.length} halls in DB.`)
    }
}
checkHalls()
