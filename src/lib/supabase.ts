import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://acjkrffhfnqrrinvlyzb.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Q6eplzmtXzszho1SJfmIGg_fCo-sjda'
const LOCAL_DB_KEY = 'fitness_club_local_db_v2'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Helper to convert object keys from camelCase to snake_case
const toSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(toSnakeCase)

    const newObj: any = {}
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        newObj[snakeKey] = toSnakeCase(obj[key])
    }
    return newObj
}

// Helper to convert object keys from snake_case to camelCase
const toCamelCase = (obj: any) => {
    if (!obj) return null
    const newObj: any = {}
    for (const key in obj) {
        const camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase())
        newObj[camelKey] = obj[key]
    }
    return newObj
}

const getLocalFallback = (table: string) => {
    try {
        const db = JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || '{}')
        return db[table] || []
    } catch (e) {
        return []
    }
}

const saveLocalFallback = (table: string, data: any[]) => {
    try {
        const db = JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || '{}')
        db[table] = data
        localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db))
    } catch (e) { }
}

const stringToSnakeCase = (str: string) => {
    // Explicit mappings for common tables to ensure consistency
    const mappings: any = {
        'revenueEntries': 'revenue_entries',
        'revenueTypes': 'revenue_types',
        'expenseEntries': 'expense_entries',
        'expenseTypes': 'expense_types',
        'systemSettings': 'system_settings',
        'clubSettings': 'club_settings',
        'clubProfiles': 'club_profiles',
        'dailyTickets': 'daily_tickets',
        'subscriptionPrices': 'subscription_prices',
        'subscriptionTypes': 'subscription_types',
        'smsMessages': 'sms_messages',
        'whatsappAutoMessages': 'whatsapp_auto_messages',
        'whatsappMediaMessages': 'whatsapp_media_messages',
        'whatsappMessageLog': 'whatsapp_message_log'
    }
    if (mappings[str]) return mappings[str]
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export const db = {
    // Helper to get current session
    getSession: () => {
        if (typeof window === 'undefined') return null
        try {
            return JSON.parse(localStorage.getItem('fitness_club_session_v2') || '{}')
        } catch (e) {
            return null
        }
    },

    // Get all records from a table (now with auto-filtering for multi-tenancy)
    getAll: async (table: string) => {
        try {
            const session = db.getSession()
            const isSuperAdmin = session && session.role === 'super_admin'
            const currentClubId = session?.clubId || session?.club_id
            const dbTable = stringToSnakeCase(table)

            let query = supabase.from(dbTable).select('*')

            // Strict data isolation for Supabase Query
            if (!isSuperAdmin && currentClubId) {
                if (!['roles', 'system_settings', 'clubs', 'revenue_types', 'expense_types', 'member_goals'].includes(dbTable)) {
                    query = query.eq('club_id', currentClubId)
                }
            }

            const { data, error } = await query
            if (error) {
                console.warn(`Supabase ${dbTable} fetch error, using local fallback:`, error.message)
                const local = getLocalFallback(table)
                if (!isSuperAdmin && currentClubId && !['roles', 'system_settings', 'clubs'].includes(dbTable)) {
                    return local.filter((i: any) => i.clubId === currentClubId || i.club_id === currentClubId)
                }
                return local
            }

            const remoteItems = (data || []).map(toCamelCase)
            let local = getLocalFallback(table)

            // Filter local data so old data from other clubs doesn't leak into this session
            if (!isSuperAdmin && currentClubId && !['roles', 'system_settings', 'clubs'].includes(dbTable)) {
                local = local.filter((i: any) => i.clubId === currentClubId || i.club_id === currentClubId)
            }

            // Merge unsynced items
            const remoteIds = new Set(remoteItems.map((i: any) => i.id))
            const unsyncedLocal = local.filter((i: any) => !remoteIds.has(i.id))
            const mergedList = [...remoteItems, ...unsyncedLocal]

            saveLocalFallback(table, mergedList)
            return mergedList
        } catch (e) {
            return getLocalFallback(table)
        }
    },

    // Get specific record
    getById: async (table: string, id: string) => {
        try {
            const session = db.getSession()
            const isSuperAdmin = session && session.role === 'super_admin'
            const currentClubId = session?.clubId || session?.club_id
            const dbTable = stringToSnakeCase(table)

            const { data, error } = await supabase.from(dbTable).select('*').eq('id', id).single()

            if (error) {
                const local = getLocalFallback(table)
                const found = local.find((i: any) => i.id === id) || null
                // Security check for local data
                if (found && !isSuperAdmin && currentClubId && (found.clubId || found.club_id) && (found.clubId !== currentClubId && found.club_id !== currentClubId)) return null
                return found
            }

            const record = toCamelCase(data)
            // Security check for remote data
            if (record && !isSuperAdmin && currentClubId && (record.clubId || record.club_id) && (record.clubId !== currentClubId && record.club_id !== currentClubId)) return null

            return record
        } catch (e) {
            return null
        }
    },

    // Add new record
    add: async (table: string, item: any) => {
        const session = db.getSession()
        const dbTable = stringToSnakeCase(table)

        // Robust ID generation (UUID)
        const generateUUID = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0
                const v = c === 'x' ? r : (r & 0x3 | 0x8)
                return v.toString(16)
            })
        }

        const id = item.id || generateUUID()
        let clubId = session?.clubId || session?.club_id || null

        // If super_admin, they can specify a club, otherwise it's forced to theirs
        if (session && session.role === 'super_admin' && item.clubId) {
            clubId = item.clubId
        }

        const newItem: any = {
            ...item,
            id,
            createdAt: item.createdAt || item.created_at || new Date().toISOString()
        }

        // Apply club filter if needed
        if (clubId && !['roles', 'system_settings', 'clubs', 'revenue_types', 'expense_types'].includes(dbTable)) {
            newItem.clubId = clubId
            newItem.club_id = clubId // Ensure both are set for consistency before snake_case conversion
        }

        // Save locally first for instant UI response
        try {
            const local = getLocalFallback(table)
            local.push(newItem)
            saveLocalFallback(table, local)
        } catch (e) {
            console.error("Local save error:", e)
        }

        try {
            const { data, error } = await supabase.from(dbTable).insert([toSnakeCase(newItem)]).select()
            if (error) {
                console.error(`Supabase Sync Error (${dbTable}):`, error.message)
                alert(`خطأ في الإضافة: ${error.message}`)
                return newItem
            }
            alert('تمت الإضافة بنجاح')
            return toCamelCase(data[0])
        } catch (e) {
            return newItem
        }
    },

    // Update existing record
    update: async (table: string, id: string, updates: any) => {
        const session = db.getSession()
        const dbTable = stringToSnakeCase(table)
        const local = getLocalFallback(table)
        const index = local.findIndex((i: any) => i.id === id)

        // Safety check: if not super_admin, verify the record belongs to their club
        if (session && session.role !== 'super_admin' && session.clubId) {
            const record = await db.getById(table, id)
            if (record && (record.clubId || record.club_id) && record.clubId !== session.clubId && record.club_id !== session.clubId) {
                console.error('Permission denied: Cannot update records of other clubs')
                return record
            }
            // Ensure they don't try to change the clubId during update
            delete updates.clubId
            delete updates.club_id
        }

        // Update locally 
        if (index > -1) {
            local[index] = { ...local[index], ...updates }
            saveLocalFallback(table, local)
        }

        try {
            const { data, error } = await supabase.from(dbTable).update(toSnakeCase(updates)).eq('id', id).select()
            if (error) {
                console.warn(`Supabase ${dbTable} update error:`, error.message)
                alert(`خطأ في التعديل: ${error.message}`)
                return local[index] || updates
            }
            alert('تم حفظ التعديلات بنجاح')
            return toCamelCase(data[0])
        } catch (e) {
            return local[index] || updates
        }
    },

    // Delete record
    delete: async (table: string, id: string, silent: boolean = false) => {
        const dbTable = stringToSnakeCase(table)
        // Delete locally
        const local = getLocalFallback(table)
        const filtered = local.filter((i: any) => i.id !== id)
        saveLocalFallback(table, filtered)

        try {
            const { error } = await supabase.from(dbTable).delete().eq('id', id)
            if (error) {
                console.warn(`Supabase ${dbTable} delete error:`, error.message)
                if (!silent) alert(`خطأ في الحذف: ${error.message}`)
            } else {
                if (!silent) alert('تم الحذف بنجاح')
            }
            return true
        } catch (e) {
            return true
        }
    },

    // Get records filtered by club
    getByClub: async (table: string, clubId: string) => {
        try {
            const session = db.getSession()
            // Even if explicitly requested by club, if not super_admin, we enforce their own club
            let targetClubId = clubId
            if (session && session.role !== 'super_admin' && session.clubId) {
                targetClubId = session.clubId
            }

            const { data, error } = await supabase.from(table).select('*').eq('club_id', targetClubId)
            if (error) {
                console.warn(`Supabase ${table} getByClub error, using local fallback:`, error.message)
                const local = getLocalFallback(table)
                return local.filter((i: any) => i.clubId === targetClubId || i.club_id === targetClubId)
            }
            const items = data.map(toCamelCase)
            return items
        } catch (e) {
            const local = getLocalFallback(table)
            return local.filter((i: any) => i.clubId === clubId || i.club_id === clubId)
        }
    },

    // Helper to get current user's club ID
    getClubId: async () => {
        if (typeof window === 'undefined') return null
        const session = JSON.parse(localStorage.getItem('fitness_club_session_v2') || '{}')
        return session.clubId || session.club_id || null
    },

    // Smart Notification System (Persistent)
    notify: async (notif: { title: string, message: string, type?: string, category?: string, link?: string, userId?: string, clubId?: string, metadata?: any }) => {
        const session = db.getSession()
        const targetClubId = notif.clubId || session?.clubId || session?.club_id
        const targetUserId = notif.userId || session?.id

        if (!targetClubId) return null

        const data: any = {
            title: notif.title,
            message: notif.message,
            type: notif.type || 'info',
            category: notif.category || 'system',
            link: notif.link || null,
            clubId: targetClubId,
            userId: targetUserId || null,
            isRead: false,
            metadata: notif.metadata || {},
            createdAt: new Date().toISOString()
        }

        // Silent add (no alert)
        const dbTable = 'notifications'
        try {
            const local = getLocalFallback('notifications')
            local.push(data)
            saveLocalFallback('notifications', local)

            const { data: remote, error } = await supabase.from(dbTable).insert([toSnakeCase(data)]).select()
            if (error) {
                console.warn('System Notification Sync Error:', error.message)
                return data
            }
            return toCamelCase(remote[0])
        } catch (e) {
            return data
        }
    }
}
