import { db } from './supabase'

export interface User {
    id: string
    name: string
    username: string
    nationalId: string
    role: 'super_admin' | 'club_admin' | 'receptionist' | 'accountant' | 'coach' | 'member'
    clubId?: string
    status: 'enabled' | 'disabled'
    systemExpiryDate?: string
    avatar?: string
}

export const auth = {
    login: async (username: string, password: string) => {
        try {
            // Check both username and nationalId
            const users = await db.getAll('users')
            const user = users.find((u: any) =>
                (u.username === username || u.nationalId === username) && u.password === password
            )

            if (!user) {
                return { success: false, message: 'رقم الهوية أو كلمة المرور غير صحيحة' }
            }

            if (user.status === 'disabled') {
                return { success: false, message: 'هذا الحساب معطل. تواصل مع مدير النظام.' }
            }

            if (user.systemExpiryDate) {
                const today = new Date().toISOString().split('T')[0]
                if (user.systemExpiryDate < today) {
                    return { success: false, message: 'انتهت مدة صلاحية استخدامك للنظام. يرجى مراجعة الإدارة.' }
                }
            }

            return { success: true, user: user as User }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' }
        }
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null
        const session = localStorage.getItem('fitness_club_session_v2')
        return session ? JSON.parse(session) : null
    },

    logout: () => {
        if (typeof window === 'undefined') return
        localStorage.removeItem('fitness_club_session_v2')
        localStorage.setItem('logout_success', 'true')
        window.location.href = '/auth/login'
    }
}
