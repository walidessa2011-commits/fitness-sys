"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Dumbbell,
    Users,
    Ticket,
    DoorOpen,
    Wallet,
    Contact2,
    MessageSquare,
    Settings,
    Bell,
    User,
    LogOut,
    Key,
    ChevronLeft,
    Calendar,
    Clock,
    Building,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info,
    Sun,
    Moon,
    Menu,
    ChevronDown,
    UserPlus,
    LayoutGrid,
    MessageCircle,
    Smartphone,
    Briefcase,
    Zap,
    TrendingUp,
    TrendingDown,
    PieChart,
    ShieldCheck,
    Cpu,
    Award,
    Gift,
    Paperclip,
    FileBarChart,
    BarChart3,
    Target
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { auth, User as UserType } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';

const routeNames: Record<string, string> = {
    'dashboard': 'الرئيسية',
    'permissions': 'الصلاحيات والوصول',
    'settings': 'الإعدادات العامة',
    'profile': 'الملف الشخصي',
    'change-password': 'تغيير كلمة المرور',
    'members': 'إدارة الأعضاء',
    'add': 'إضافة',
    'subscription-types': 'أنواع الاشتراكات',
    'activities': 'الأنشطة والألعاب',
    'subscription-prices': 'قيمة الاشتراكات',
    'subscriptions': 'تسجيل الاشتراكات',
    'subscription-report': 'تحليل الاشتراكات',
    'tickets': 'التذاكر',
    'types': 'الأنواع',
    'reports': 'التقارير',
    'attendance': 'تسجيل الدخول',
    'lockers': 'الخزائن',
    'halls': 'صالات الدخول',
    'sessions': 'فترات الدخول',
    'employees': 'الموظفين',
    'crm': 'خدمة العملاء',
    'messages': 'الرسائل',
    'whatsapp': 'واتساب آلي',
    'whatsapp-media': 'رسائل وسائط للواتس',
    'client-reports': 'تقارير العملاء والعضوية',
    'finance': 'المالية',
    'invoices': 'الفواتير',
    'revenues': 'الإيرادات',
    'expenses': 'المصروفات',
    'clubs': 'النوادي',
    'admin': 'لوحة التحكم',
    'coaches': 'بيانات المدربين',
    'notifications': 'مركز الإشعارات',
    'club-profile': 'بيانات المؤسسة',
    'goals': 'الأهداف والملاحظات'
};

const getRouteName = (segment: string) => {
    return routeNames[segment] || segment;
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserType | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isLicenseDetailsOpen, setIsLicenseDetailsOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [time, setTime] = useState('');
    const [clubName, setClubName] = useState('');
    const [clubLogo, setClubLogo] = useState('');
    const [programName, setProgramName] = useState('FITNESS CLUB SO');
    const [licenseDays, setLicenseDays] = useState<number | null>(null);
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
    const [themeConfig, setThemeConfig] = useState<any>(null);

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);

        // Function to load profile
        const loadProfile = async (currentUser: any) => {
            const { db } = await import('@/lib/supabase');
            if (currentUser.clubId) {
                // Try to get data from club_profiles for logo and Arabic name
                const profiles = await db.getAll('club_profiles');
                const profile = profiles.find((p: any) => p.clubId === currentUser.clubId || p.club_id === currentUser.clubId);

                if (profile) {
                    if (profile.nameAr) setClubName(profile.nameAr);
                    else if (profile.name) setClubName(profile.name);

                    if (profile.logoUrl || profile.logo_url) {
                        setClubLogo(profile.logoUrl || profile.logo_url);
                    }
                } else {
                    // Fallback to basic club name
                    const club: any = await db.getById('clubs', currentUser.clubId!);
                    if (club?.name) setClubName(club.name);
                    if (club?.logo) setClubLogo(club.logo);
                }

                // Load Smart Theme Settings
                const rawSettings = await db.getAll('club_settings');
                const clubSettings = rawSettings.find((s: any) => s.clubId === currentUser.clubId || s.club_id === currentUser.clubId);
                if (clubSettings) {
                    setThemeConfig(clubSettings);
                }
            }

            const settings: any = await db.getAll('system_settings');
            if (settings && settings.length > 0) {
                setProgramName(settings[0].siteName || 'FITNESS CLUB SO');
            }
        };

        loadProfile(currentUser);

        // Listen for profile updates
        const handleProfileUpdate = () => loadProfile(currentUser);
        window.addEventListener('club-profile-updated', handleProfileUpdate);

        // Load Dynamic & Persistent Notifications
        import('@/lib/supabase').then(async ({ db }) => {
            // Run Smart Sync first
            const { NotificationEngine } = await import('@/lib/notifications');
            await NotificationEngine.sync();

            const dbNotifs = await db.getAll('notifications');
            const notifs = [];

            // Add dynamic system alerts (not stored in DB because they are time-relative)
            if (currentUser.systemExpiryDate) {
                const expiry = new Date(currentUser.systemExpiryDate);
                const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 30) {
                    notifs.push({
                        id: 'sys',
                        title: 'تنبيه النظام',
                        message: `متبقي ${diffDays > 0 ? diffDays : 0} يوم على انتهاء الترخيص.`,
                        type: diffDays <= 5 ? 'error' : 'warning'
                    });
                }
            }

            // Merge with DB notifications (limit to latest 10 for the dropdown)
            const combined = [
                ...notifs,
                ...dbNotifs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            ].slice(0, 10);

            setNotifications(combined);
        });

        // Set license days and expiry date
        if (currentUser.systemExpiryDate) {
            setExpiryDate(currentUser.systemExpiryDate);
            const expiry = new Date(currentUser.systemExpiryDate);
            const today = new Date();
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setLicenseDays(diffDays > 0 ? diffDays : 0);
        }

        // Close menus when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.nav-menu-container') && !target.closest('.nav-button') && !target.closest('.license-widget')) {
                setActiveMenu(null);
                setIsAccountOpen(false);
                setIsNotifOpen(false);
                setIsLicenseDetailsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Initial theme
        if (localStorage.getItem('theme') === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        // Live clock
        const tick = () => {
            const now = new Date();
            setTime(now.toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + now.toLocaleTimeString('ar-SA'));
        };
        tick();
        const timer = setInterval(tick, 1000);
        window.addEventListener('club-profile-updated', handleProfileUpdate);

        return () => {
            clearInterval(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('club-profile-updated', handleProfileUpdate);
        };
    }, [router]);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        auth.logout();
    };


    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-['Tajawal',_sans-serif]">
            {/* Dynamic CSS Customization injected globally */}
            {themeConfig && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                        ${themeConfig.themeHeaderFrom ? `--theme-header-from: ${themeConfig.themeHeaderFrom};` : ''}
                        ${themeConfig.themeHeaderTo ? `--theme-header-to: ${themeConfig.themeHeaderTo};` : ''}
                        ${themeConfig.themeHeaderBg ? `--theme-header-bg: ${themeConfig.themeHeaderBg};` : ''}
                        ${themeConfig.themeTableBg ? `--theme-table-bg: ${themeConfig.themeTableBg};` : ''}
                        ${themeConfig.themeTableText ? `--theme-table-text: ${themeConfig.themeTableText};` : ''}
                        ${themeConfig.themeButtonBg ? `--theme-btn-bg: ${themeConfig.themeButtonBg};` : ''}
                        ${themeConfig.themeButtonText ? `--theme-btn-text: ${themeConfig.themeButtonText};` : ''}
                    }

                    /* 1. Header Overrides */
                    ${themeConfig.themeHeaderFrom && themeConfig.themeHeaderTo ? `
                    .bg-gradient-to-r.from-\\[\\#1e3a8a\\].to-\\[\\#2563eb\\] {
                        background-image: linear-gradient(to right, var(--theme-header-from), var(--theme-header-to)) !important;
                    }
                    header.bg-\\[\\#1e40af\\], .bg-\\[\\#1e40af\\] {
                        background-color: var(--theme-header-bg, ${themeConfig.themeHeaderFrom}) !important;
                    }
                    div.bg-\\[\\#1e40af\\] {
                        background-color: var(--theme-header-bg, ${themeConfig.themeHeaderFrom}) !important;
                    }
                    ` : ''}

                    /* 2. Table Headers Overrides */
                    ${themeConfig.themeTableBg || themeConfig.themeTableText ? `
                    table th, table thead tr, .table-header, th.bg-slate-50, th.bg-blue-50\\/50, th.bg-gray-50, thead {
                        ${themeConfig.themeTableBg ? `background-color: var(--theme-table-bg) !important;` : ''}
                        ${themeConfig.themeTableText ? `color: var(--theme-table-text) !important;` : ''}
                        ${themeConfig.themeTableText ? `border-color: var(--theme-table-bg) !important;` : ''}
                    }
                    ` : ''}

                    /* 3. Buttons Overrides */
                    ${themeConfig.themeButtonBg || themeConfig.themeButtonText ? `
                    .btn-premium.btn-premium-blue, button.bg-blue-600, button.bg-indigo-600, a.bg-blue-600, a.bg-indigo-600, .bg-blue-600, .bg-indigo-600 {
                        ${themeConfig.themeButtonBg ? `background-color: var(--theme-btn-bg) !important;` : ''}
                        ${themeConfig.themeButtonBg ? `background-image: none !important;` : ''}
                        ${themeConfig.themeButtonBg ? `border-color: var(--theme-btn-bg) !important;` : ''}
                        ${themeConfig.themeButtonText ? `color: var(--theme-btn-text) !important;` : ''}
                    }
                    ` : ''}
                ` }} />
            )}

            {/* Top Info Bar */}
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] h-10 flex items-center justify-between px-4 text-white text-[11px] print:hidden">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <Calendar className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                        <span className="truncate">{time}</span>
                    </div>
                    {(user.clubId || clubName) && (
                        <div className="hidden sm:flex items-center gap-1.5 overflow-hidden">
                            <Building className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                            <span className="truncate">{clubName || 'جاري التحميل...'}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                    <User className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    <span className="truncate">الموظف: <strong className="text-yellow-200">{user.name}</strong></span>
                </div>
            </div>

            {/* Main Toolbar / Navbar */}
            <header className="bg-[#1e40af] dark:bg-slate-900 sticky top-0 z-[100] shadow-lg flex items-stretch justify-between h-16 border-b border-white/10 print:hidden">
                <div className="flex items-stretch flex-1">
                    {/* Mobile Hamburger - Visible on lg:hidden */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden flex items-center justify-center px-4 text-blue-200 hover:text-white hover:bg-white/5 transition-colors border-l border-white/10"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Logo */}
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 md:px-6 border-l border-white/10 hover:bg-white/5 transition-colors">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center text-white overflow-hidden shrink-0">
                            {clubLogo ? (
                                <img src={clubLogo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Dumbbell className="w-5 h-5 md:w-6 md:h-6" />
                            )}
                        </div>
                        <div className="block">
                            <div className="text-xs md:text-sm font-black text-white leading-tight uppercase truncate max-w-[120px] md:max-w-none">{clubName || programName}</div>
                            <div className="text-[9px] md:text-[10px] text-blue-200">لوحة التحكم</div>
                        </div>
                    </Link>

                    {/* Navigation Menus - Hidden on mobile, visible on lg:flex */}
                    <nav className="hidden lg:flex items-stretch uppercase tracking-tight">
                        <NavMenu
                            icon={<Users className="w-5 h-5" />}
                            label="الأعضاء"
                            active={pathname.includes('/members')}
                            isOpen={activeMenu === 'members'}
                            onToggle={() => setActiveMenu(activeMenu === 'members' ? null : 'members')}
                        >
                            <div className="p-1 min-w-[200px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">إدارة الأعضاء</div>
                                <MenuLink href="/admin/members" icon={<Users className="w-4 h-4" />}>قائمة الأعضاء</MenuLink>
                                <MenuLink href="/admin/members/subscription-report" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>الاشتراكات (تقارير)</MenuLink>
                                <MenuLink href="/admin/members/subscriptions" icon={<UserPlus className="w-4 h-4" />}>تسجيل الاشتراكات</MenuLink>
                                <MenuLink href="/admin/members/subscription-types" icon={<Calendar className="w-4 h-4" />}>أنواع الاشتراكات</MenuLink>
                                <MenuLink href="/admin/members/goals" icon={<Target className="w-4 h-4" />}>تسجيل الأهداف والملاحظات</MenuLink>
                                <MenuLink href="/admin/members/activities" icon={<Dumbbell className="w-4 h-4" />}>الأنشطة والألعاب</MenuLink>
                                <MenuLink href="/admin/members/subscription-prices" icon={<Wallet className="w-4 h-4" />}>قيمة الاشتراكات</MenuLink>
                            </div>
                        </NavMenu>

                        <NavMenu
                            icon={<Ticket className="w-5 h-5" />}
                            label="التذاكر"
                            active={pathname.includes('/tickets')}
                            isOpen={activeMenu === 'tickets'}
                            onToggle={() => setActiveMenu(activeMenu === 'tickets' ? null : 'tickets')}
                        >
                            <div className="p-1 min-w-[200px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">إدارة التذاكر</div>
                                <MenuLink href="/admin/tickets" icon={<Ticket className="w-4 h-4" />}>التذاكر اليومية</MenuLink>
                                <MenuLink href="/admin/tickets/types" icon={<Settings className="w-4 h-4" />}>أنواع التذاكر</MenuLink>
                                <MenuLink href="/admin/tickets/promotions" icon={<Gift className="w-4 h-4 text-rose-500" />}>العروض الترويجية</MenuLink>
                                <MenuLink href="/admin/tickets/reports" icon={<TrendingUp className="w-4 h-4" />}>تقارير التذاكر</MenuLink>
                            </div>
                        </NavMenu>

                        <NavMenu
                            icon={<DoorOpen className="w-5 h-5" />}
                            label="الدخول"
                            active={pathname.includes('/access') || pathname.includes('/attendance')}
                            isOpen={activeMenu === 'access'}
                            onToggle={() => setActiveMenu(activeMenu === 'access' ? null : 'access')}
                        >
                            <div className="p-1 min-w-[200px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">بوابة الدخول</div>
                                <MenuLink href="/admin/attendance" icon={<UserPlus className="w-4 h-4" />}>تسجيل الدخول</MenuLink>
                                <MenuLink href="/admin/attendance/halls" icon={<LayoutGrid className="w-4 h-4" />}>صالات الدخول</MenuLink>
                                <MenuLink href="/admin/attendance/lockers" icon={<LayoutGrid className="w-4 h-4" />}>إدارة الخزائن</MenuLink>
                                <MenuLink href="/admin/attendance/sessions" icon={<Clock className="w-4 h-4" />}>فترات الدخول</MenuLink>
                            </div>
                        </NavMenu>

                        <NavMenu
                            icon={<Briefcase className="w-5 h-5" />}
                            label="الموظفين"
                            active={pathname.includes('/employees')}
                            isOpen={activeMenu === 'employees'}
                            onToggle={() => setActiveMenu(activeMenu === 'employees' ? null : 'employees')}
                        >
                            <div className="p-1 min-w-[200px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">إدارة الموظفين</div>
                                <MenuLink href="/admin/employees" icon={<Users className="w-4 h-4" />}>قائمة الموظفين</MenuLink>
                                <MenuLink href="/admin/employees/coaches" icon={<Award className="w-4 h-4" />}>بيانات المدربين</MenuLink>
                                <MenuLink href="/admin/employees/permissions" icon={<ShieldCheck className="w-4 h-4" />}>صلاحيات الوصول</MenuLink>
                            </div>
                        </NavMenu>

                        <NavMenu
                            icon={<MessageCircle className="w-5 h-5" />}
                            label="التواصل"
                            active={pathname.includes('/crm') && !pathname.includes('client-reports')}
                            isOpen={activeMenu === 'crm'}
                            onToggle={() => setActiveMenu(activeMenu === 'crm' ? null : 'crm')}
                        >
                            <div className="p-1 min-w-[220px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">خدمة العملاء (CRM)</div>
                                <MenuLink href="/admin/crm/messages" icon={<MessageSquare className="w-4 h-4" />}>الرسائل</MenuLink>
                                <MenuLink href="/admin/crm/whatsapp" icon={<Smartphone className="w-4 h-4" />}>واتساب آلي</MenuLink>
                                <MenuLink href="/admin/crm/whatsapp-media" icon={<Paperclip className="w-4 h-4 text-green-500" />}>رسائل وسائط للواتس</MenuLink>
                            </div>
                        </NavMenu>

                        <NavMenu
                            icon={<BarChart3 className="w-5 h-5" />}
                            label="التقارير"
                            active={pathname.includes('client-reports') || pathname.includes('finance/reports')}
                            isOpen={activeMenu === 'reports'}
                            onToggle={() => setActiveMenu(activeMenu === 'reports' ? null : 'reports')}
                        >
                            <div className="p-1 min-w-[220px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">مركز التقارير</div>
                                <MenuLink href="/admin/crm/client-reports" icon={<FileBarChart className="w-4 h-4 text-blue-500" />}>تقارير العملاء والعضوية</MenuLink>
                                <MenuLink href="/admin/finance/reports" icon={<PieChart className="w-4 h-4" />}>تقارير الحسابات والخزينة</MenuLink>
                            </div>
                        </NavMenu>

                        <NavMenu
                            icon={<Wallet className="w-5 h-5" />}
                            label="المالية"
                            active={pathname.includes('/finance') && !pathname.includes('/reports')}
                            isOpen={activeMenu === 'finance'}
                            onToggle={() => setActiveMenu(activeMenu === 'finance' ? null : 'finance')}
                        >
                            <div className="p-1 min-w-[220px]">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">الإدارة المالية</div>
                                <MenuLink href="/admin/finance/invoices" icon={<Wallet className="w-4 h-4" />}>الفواتير</MenuLink>
                                <MenuLink href="/admin/finance/revenues" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>الإيرادات</MenuLink>
                                <MenuLink href="/admin/finance/expenses" icon={<TrendingDown className="w-4 h-4 text-rose-500" />}>المصروفات</MenuLink>
                            </div>
                        </NavMenu>

                        {(user.role === 'super_admin' || user.role === 'club_admin') && (
                            <NavMenu
                                icon={<Settings className="w-5 h-5" />}
                                label="النظام"
                                active={pathname.includes('/settings') || pathname.includes('/system-settings') || pathname.includes('/access-devices') || pathname.includes('/club-profile')}
                                isOpen={activeMenu === 'settings'}
                                onToggle={() => setActiveMenu(activeMenu === 'settings' ? null : 'settings')}
                            >
                                <div className="p-1 min-w-[200px]">
                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">إعدادات النظام</div>
                                    <MenuLink href="/admin/club-profile" icon={<Building className="w-4 h-4" />}>بيانات المؤسسة</MenuLink>
                                    <MenuLink href="/admin/system-settings" icon={<Zap className="w-4 h-4" />}>إعدادات النظام (الخيارات)</MenuLink>
                                    <MenuLink href="/admin/access-devices" icon={<Cpu className="w-4 h-4" />}>إعدادات أجهزة الدخول</MenuLink>
                                    {user.role === 'super_admin' && (
                                        <>
                                            <MenuLink href="/admin/settings" icon={<Settings className="w-4 h-4" />}>الإعدادات العامة لموقع</MenuLink>
                                            <MenuLink href="/admin/clubs" icon={<Building className="w-4 h-4" />}>إدارة النوادي</MenuLink>
                                            <MenuLink href="/admin/permissions" icon={<ShieldCheck className="w-4 h-4" />}>الصلاحيات</MenuLink>
                                        </>
                                    )}
                                </div>
                            </NavMenu>
                        )}
                    </nav>
                </div>

                {/* Right Action Side */}
                <div className="flex items-stretch px-2 md:px-4 gap-1 md:gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center justify-center w-10 md:w-12 text-blue-200 hover:text-white hover:bg-white/10 transition-all"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative flex items-stretch nav-menu-container">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsNotifOpen(!isNotifOpen);
                                setIsAccountOpen(false);
                                setIsMobileMenuOpen(false);
                                setActiveMenu(null);
                            }}
                            className="flex flex-col items-center justify-center w-12 md:w-16 text-blue-200 hover:text-white hover:bg-white/10 transition-all gap-1 nav-button"
                        >
                            <div className="relative">
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#1e40af] rounded-full"></span>
                                )}
                            </div>
                            <span className="text-[9px] md:text-[10px]">الإشعارات</span>
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 w-[280px] sm:w-80 bg-white dark:bg-slate-800 shadow-2xl rounded-b-2xl border border-gray-300 dark:border-slate-700 mt-1 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-900 dark:text-white">الإشعارات الجديدة {notifications.length > 0 && `(${notifications.length})`}</span>
                                        <Link href="/admin/notifications" onClick={() => setIsNotifOpen(false)} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50">عرض الكل</Link>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto p-0 flex flex-col">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                                                <Bell className="w-10 h-10 opacity-20 mb-2" />
                                                <p className="text-xs">لا توجد إشعارات جديدة</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-200 dark:divide-slate-800/50">
                                                {notifications.map((n, i) => (
                                                    <div key={i} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 items-start ${n.type === 'error' ? 'bg-rose-50/30 dark:bg-rose-900/5' : ''}`}>
                                                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${n.type === 'error' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                            {n.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-black text-gray-900 dark:text-white mb-0.5 truncate">{n.title}</div>
                                                            <div className="text-[10px] font-bold text-gray-500 dark:text-slate-400 leading-tight">{n.message}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Account */}
                    <div className="relative flex items-stretch nav-menu-container">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAccountOpen(!isAccountOpen);
                                setIsNotifOpen(false);
                                setIsMobileMenuOpen(false);
                                setActiveMenu(null);
                            }}
                            className="flex flex-col items-center justify-center w-12 md:w-16 text-blue-200 hover:text-white hover:bg-white/10 transition-all gap-1 nav-button"
                        >
                            <div className="w-7 h-7 rounded-full border-2 border-white/30 overflow-hidden bg-white/20">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-1" />
                                )}
                            </div>
                            <span className="text-[9px] md:text-[10px]">حسابي</span>
                        </button>

                        <AnimatePresence>
                            {isAccountOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 w-56 bg-white dark:bg-slate-800 shadow-2xl rounded-b-2xl border border-gray-300 dark:border-slate-700 mt-1"
                                >
                                    <div className="p-4 border-b border-gray-300 dark:border-slate-700">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-[10px] text-gray-400 capitalize">{user.role}</div>
                                    </div>
                                    <div className="p-1">
                                        <AccountLink href="/admin/profile" icon={<User className="w-4 h-4" />}>الملف الشخصي</AccountLink>
                                        <AccountLink href="/admin/change-password" icon={<Key className="w-4 h-4" />}>تغيير كلمة المرور</AccountLink>
                                        <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold transition-all"
                                        >
                                            <LogOut className="w-4 h-4 icon-glow" />
                                            <span>تسجيل الخروج</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Floating License Expiry Widget */}
            <AnimatePresence>
                {licenseDays !== null && licenseDays <= 30 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-14 right-6 z-[200] license-widget print:hidden"
                    >
                        <div className="relative">
                            <AnimatePresence>
                                {isLicenseDetailsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-[calc(100%+12px)] right-0 w-[280px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden"
                                    >
                                        <div className="bg-gradient-to-l from-rose-500 to-rose-600 p-4 text-white flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <AlertTriangle className="w-4 h-4 text-rose-100" />
                                                    <h4 className="text-sm font-black text-rose-50">تفاصيل الترخيص</h4>
                                                </div>
                                                <p className="text-[10px] text-rose-200 font-bold leading-tight">النظام قارب على التوقف</p>
                                            </div>
                                            <button onClick={() => setIsLicenseDetailsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                                                <XCircle className="w-4 h-4 icon-glow" />
                                            </button>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-center border-b border-gray-300 dark:border-slate-800 pb-2">
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400">حالة الاشتراك</span>
                                                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md">مشارف على الانتهاء</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-300 dark:border-slate-800 pb-2">
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400">المدة المتبقية</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{licenseDays === 0 ? 'أقل من يوم' : `${licenseDays} يوم`}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2">
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400">تاريخ الانتهاء</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{expiryDate ? new Date(expiryDate).toLocaleDateString('ar-SA') : '---'}</span>
                                            </div>
                                            <Link href="/admin/system-settings" className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black py-2.5 rounded-xl hover:scale-[1.02] transition-transform">
                                                تجديد الترخيص الآن
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => setIsLicenseDetailsOpen(!isLicenseDetailsOpen)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl transition-all border group ${isLicenseDetailsOpen
                                    ? 'bg-rose-50 dark:bg-slate-800 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 ring-4 ring-rose-500/10'
                                    : 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400'
                                    }`}
                            >
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30">
                                    <AlertTriangle className={`w-4 h-4 ${isLicenseDetailsOpen ? '' : 'animate-pulse'}`} />
                                    {!isLicenseDetailsOpen && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white dark:border-slate-800"></span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col items-start min-w-[100px]">
                                    <span className="text-[11px] font-black text-gray-900 dark:text-white leading-tight">تنبيه الترخيص</span>
                                    <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 mt-0.5">
                                        متبقي {licenseDays} يوم
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ml-1 ${isLicenseDetailsOpen ? 'rotate-180 text-rose-500' : 'text-gray-300 dark:text-slate-600 group-hover:text-rose-400'}`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-72 sm:w-80 bg-white dark:bg-slate-900 z-[201] shadow-2xl flex flex-col font-['Tajawal',_sans-serif]"
                        >
                            <div className="bg-[#1e40af] p-6 text-white shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                                        {clubLogo ? <img src={clubLogo} alt="Logo" className="w-full h-full object-cover" /> : <Dumbbell className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black uppercase tracking-tight">{clubName || programName}</div>
                                        <div className="text-[10px] text-blue-200">القائمة الرئيسية</div>
                                    </div>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 py-6">
                                <MobileNavSection
                                    id="members"
                                    icon={<Users className="w-5 h-5" />}
                                    label="الأعضاء"
                                    expanded={expandedMobileMenu === 'members'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'members' ? null : 'members')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/members" icon={<Users className="w-4 h-4" />}>قائمة الأعضاء</MenuLink>
                                    <MenuLink href="/admin/members/subscription-report" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>الاشتراكات (تقارير)</MenuLink>
                                    <MenuLink href="/admin/members/subscriptions" icon={<UserPlus className="w-4 h-4" />}>تسجيل الاشتراكات</MenuLink>
                                    <MenuLink href="/admin/members/subscription-types" icon={<Calendar className="w-4 h-4" />}>أنواع الاشتراكات</MenuLink>
                                    <MenuLink href="/admin/members/activities" icon={<Dumbbell className="w-4 h-4" />}>الأنشطة والألعاب</MenuLink>
                                    <MenuLink href="/admin/members/subscription-prices" icon={<Wallet className="w-4 h-4" />}>قيمة الاشتراكات</MenuLink>
                                </MobileNavSection>

                                <MobileNavSection
                                    id="tickets"
                                    icon={<Ticket className="w-5 h-5" />}
                                    label="التذاكر"
                                    expanded={expandedMobileMenu === 'tickets'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'tickets' ? null : 'tickets')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/tickets" icon={<Ticket className="w-4 h-4" />}>التذاكر اليومية</MenuLink>
                                    <MenuLink href="/admin/tickets/types" icon={<Settings className="w-4 h-4" />}>أنواع التذاكر</MenuLink>
                                    <MenuLink href="/admin/tickets/promotions" icon={<Gift className="w-4 h-4 text-rose-500" />}>العروض الترويجية</MenuLink>
                                    <MenuLink href="/admin/tickets/reports" icon={<TrendingUp className="w-4 h-4" />}>تقارير التذاكر</MenuLink>
                                </MobileNavSection>

                                <MobileNavSection
                                    id="access"
                                    icon={<DoorOpen className="w-5 h-5" />}
                                    label="الدخول"
                                    expanded={expandedMobileMenu === 'access'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'access' ? null : 'access')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/attendance" icon={<UserPlus className="w-4 h-4" />}>تسجيل الدخول</MenuLink>
                                    <MenuLink href="/admin/attendance/halls" icon={<LayoutGrid className="w-4 h-4" />}>صالات الدخول</MenuLink>
                                    <MenuLink href="/admin/attendance/lockers" icon={<LayoutGrid className="w-4 h-4" />}>إدارة الخزائن</MenuLink>
                                    <MenuLink href="/admin/attendance/sessions" icon={<Clock className="w-4 h-4" />}>فترات الدخول</MenuLink>
                                </MobileNavSection>

                                <MobileNavSection
                                    id="employees"
                                    icon={<Briefcase className="w-5 h-5" />}
                                    label="الموظفين"
                                    expanded={expandedMobileMenu === 'employees'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'employees' ? null : 'employees')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/employees" icon={<Users className="w-4 h-4" />}>قائمة الموظفين</MenuLink>
                                    <MenuLink href="/admin/employees/coaches" icon={<Award className="w-4 h-4" />}>بيانات المدربين</MenuLink>
                                    <MenuLink href="/admin/employees/permissions" icon={<ShieldCheck className="w-4 h-4" />}>صلاحيات الوصول</MenuLink>
                                </MobileNavSection>

                                <MobileNavSection
                                    id="crm"
                                    icon={<MessageCircle className="w-5 h-5" />}
                                    label="التواصل"
                                    expanded={expandedMobileMenu === 'crm'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'crm' ? null : 'crm')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/crm/messages" icon={<MessageSquare className="w-4 h-4" />}>الرسائل</MenuLink>
                                    <MenuLink href="/admin/crm/whatsapp" icon={<Smartphone className="w-4 h-4" />}>واتساب آلي</MenuLink>
                                    <MenuLink href="/admin/crm/whatsapp-media" icon={<Paperclip className="w-4 h-4 text-green-500" />}>رسائل وسائط للواتس</MenuLink>
                                </MobileNavSection>

                                <MobileNavSection
                                    id="reports"
                                    icon={<BarChart3 className="w-5 h-5" />}
                                    label="التقارير"
                                    expanded={expandedMobileMenu === 'reports'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'reports' ? null : 'reports')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/crm/client-reports" icon={<FileBarChart className="w-4 h-4 text-blue-500" />}>تقارير العملاء والعضوية</MenuLink>
                                    <MenuLink href="/admin/finance/reports" icon={<PieChart className="w-4 h-4" />}>تقارير الحسابات والخزينة</MenuLink>
                                </MobileNavSection>

                                <MobileNavSection
                                    id="finance"
                                    icon={<Wallet className="w-5 h-5" />}
                                    label="المالية"
                                    expanded={expandedMobileMenu === 'finance'}
                                    onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'finance' ? null : 'finance')}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                >
                                    <MenuLink href="/admin/finance/invoices" icon={<Wallet className="w-4 h-4" />}>الفواتير</MenuLink>
                                    <MenuLink href="/admin/finance/revenues" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>الإيرادات</MenuLink>
                                    <MenuLink href="/admin/finance/expenses" icon={<TrendingDown className="w-4 h-4 text-rose-500" />}>المصروفات</MenuLink>
                                </MobileNavSection>

                                {(user.role === 'super_admin' || user.role === 'club_admin') && (
                                    <MobileNavSection
                                        id="settings"
                                        icon={<Settings className="w-5 h-5" />}
                                        label="النظام"
                                        expanded={expandedMobileMenu === 'settings'}
                                        onToggle={() => setExpandedMobileMenu(expandedMobileMenu === 'settings' ? null : 'settings')}
                                        onClose={() => setIsMobileMenuOpen(false)}
                                    >
                                        <MenuLink href="/admin/club-profile" icon={<Building className="w-4 h-4" />}>بيانات المؤسسة</MenuLink>
                                        <MenuLink href="/admin/system-settings" icon={<Zap className="w-4 h-4" />}>إعدادات النظام (الخيارات)</MenuLink>
                                        <MenuLink href="/admin/access-devices" icon={<Cpu className="w-4 h-4" />}>إعدادات أجهزة الدخول</MenuLink>
                                        {user.role === 'super_admin' && (
                                            <>
                                                <MenuLink href="/admin/settings" icon={<Settings className="w-4 h-4" />}>الإعدادات العامة لموقع</MenuLink>
                                                <MenuLink href="/admin/clubs" icon={<Building className="w-4 h-4" />}>إدارة النوادي</MenuLink>
                                                <MenuLink href="/admin/permissions" icon={<ShieldCheck className="w-4 h-4" />}>الصلاحيات</MenuLink>
                                            </>
                                        )}
                                    </MobileNavSection>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-slate-800 shrink-0 space-y-2">
                                <AccountLink href="/admin/profile" icon={<User className="w-4 h-4" />}>الملف الشخصي</AccountLink>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-black transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>تسجيل الخروج</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Breadcrumb Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 h-10 flex items-center gap-2 overflow-x-auto text-[10px] md:text-xs whitespace-nowrap scrollbar-hide print:hidden">
                <Link href="/admin/dashboard" className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    <ChevronLeft className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span>الرئيسية</span>
                </Link>
                {pathname !== '/admin/dashboard' && (
                    <>
                        <span className="text-gray-300 dark:text-slate-700 shrink-0">/</span>
                        <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-bold shrink-0">
                            <span>{getRouteName(pathname.split('/').pop() || '')}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content */}
            <main className="pt-2 px-3 md:px-6 max-w-full pb-20 print:p-0 print:m-0">
                {children}
            </main>

            {/* Bottom Program Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 h-10 flex items-center px-4 md:px-6 z-[100] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] print:hidden">
                <div className="flex-1 flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
                        <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{programName}</span>
                </div>

                <div className="hidden md:flex flex-1 justify-center">
                    {licenseDays !== null && (
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-5 py-1 rounded-full border border-gray-300 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-slate-700 pl-3">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">المدة المتبقية: <strong className="text-blue-600 dark:text-blue-400">{licenseDays} يوم</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 pr-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">تاريخ الانتهاء: <strong className="text-indigo-600 dark:text-indigo-400">{expiryDate ? new Date(expiryDate).toLocaleDateString('ar-SA') : '---'}</strong></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-end gap-1 md:gap-2 text-gray-400 dark:text-slate-500 overflow-hidden text-[9px] md:text-[10px]">
                    <Building className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                    <span className="font-bold truncate">{clubName || 'جاري التحميل...'}</span>
                </div>
            </footer>

            <DeleteModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="تسجيل الخروج"
                message="هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟"
                confirmText="نعم"
                icon={<LogOut className="w-6 h-6 relative z-10" />}
                variant="info"
            />
        </div>
    );
}

function NavMenu({ icon, label, active, children, isOpen, onToggle }: { icon: React.ReactNode, label: string, active: boolean, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
    return (
        <div className="relative flex items-stretch nav-menu-container">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={`flex flex-col items-center justify-center px-5 min-w-[70px] transition-all gap-1.5 nav-button ${active ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/5'
                    }`}
            >
                {icon}
                <span className="text-[10px] font-bold">{label}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 bg-white dark:bg-slate-800 shadow-2xl rounded-b-2xl border border-gray-300 dark:border-slate-700 mt-1 min-w-[200px]"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuLink({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all">
            <div className="text-gray-400 dark:text-slate-500">{icon}</div>
            <span>{children}</span>
        </Link>
    );
}

function AccountLink({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Link href={href} onClick={() => { }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-xs font-black transition-all">
            <div className="text-gray-400 dark:text-slate-500">{icon}</div>
            <span>{children}</span>
        </Link>
    );
}

function MobileNavSection({ id, icon, label, children, expanded, onToggle, onClose }: { id: string, icon: React.ReactNode, label: string, children: React.ReactNode, expanded: boolean, onToggle: () => void, onClose: () => void }) {
    return (
        <div className="flex flex-col gap-1">
            <button
                onClick={onToggle}
                className={`flex items-center justify-between w-full p-3 rounded-2xl transition-all ${expanded ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`${expanded ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</div>
                    <span className="text-xs font-black">{label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-1 pr-4"
                    >
                        <div onClick={onClose}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

