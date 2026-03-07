
import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://acjkrffhfnqrrinvlyzb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkHullsData() {
    const { data, error } = await supabase.from('halls').select('id, name, club_id')
    if (error) {
        console.error("Error:", error)
    } else {
        console.log(`Halls in DB: ${data.length}`)
        data.forEach(h => console.log(`- Hall: ${h.name}, Club: ${h.club_id}`))
    }
}
checkHullsData()
