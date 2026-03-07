
import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://acjkrffhfnqrrinvlyzb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkUsers() {
    console.log("Checking users...")
    const { data, error } = await supabase.from('users').select('id, name, username, role, club_id')
    if (error) {
        console.error("Error:", error)
    } else {
        data.forEach(u => {
            console.log(`- User: ${u.username}, Role: ${u.role}, Club: ${u.club_id}`)
        })
    }
}
checkUsers()
