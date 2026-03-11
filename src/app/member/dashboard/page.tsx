"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LogOut,
    User,
    CreditCard,
    Calendar,
    Clock,
    Trophy,
    Activity,
    ChevronLeft,
    Sparkles,
    Dumbbell,
    Crown,
    Shield,
    CheckCircle2,
    XCircle,
    PauseCircle,
    Bell,
    Settings,
    BarChart3,
    CalendarDays,
    Timer,
    TrendingUp,
    Target,
    Loader2,
    Sun,
    Moon,
    Languages,
    Tag,
    Percent,
    Gift,
    Star,
    Flame,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// ─── i18n Translations ──────────────────────────────────────────────
const translations = {
    ar: {
        dir: 'rtl' as const,
        // Status bar
        memberApp: 'تطبيق العضو',
        // Welcome
        welcome: 'مرحباً،',
        // Tabs
        tabHome: 'الرئيسية',
        tabOffers: 'العروض',
        tabSubs: 'اشتراكاتي',
        tabProfile: 'حسابي',
        // Active subscription
        activeSub: 'اشتراكك النشط',
        active: 'نشط',
        remaining: 'المتبقي',
        day: 'يوم',
        days: 'يوم',
        noActiveSub: 'لا يوجد اشتراك نشط حالياً',
        noActiveSubHint: 'تواصل مع إدارة النادي لتجديد اشتراكك',
        // Stats
        yourSubs: 'اشتراكاتك',
        monthAttendance: 'حضور الشهر',
        totalVisits: 'إجمالي الزيارات',
        // Recent attendance
        recentVisits: 'آخر الزيارات',
        record: 'سجل',
        visit: 'زيارة',
        noAttendance: 'لا توجد سجلات حضور',
        // Subscriptions tab
        mySubs: 'اشتراكاتي',
        startDate: 'البداية',
        endDate: 'النهاية',
        amount: 'المبلغ',
        sar: 'ر.س',
        noSubs: 'لا توجد اشتراكات',
        frozen: 'موقف',
        expired: 'منتهي',
        // Profile tab
        nationalId: 'رقم الهوية',
        phone: 'رقم الجوال',
        email: 'البريد الإلكتروني',
        status: 'الحالة',
        logout: 'تسجيل الخروج',
        // Offers tab
        clubOffers: 'عروض النادي',
        currentOffers: 'العروض الحالية',
        discount: 'خصم',
        extraDays: 'أيام إضافية',
        pauseAllowed: 'يسمح بالتجميد',
        pauseNotAllowed: 'لا يسمح بالتجميد',
        contactClub: 'تواصل مع النادي للاستفادة',
        noOffers: 'لا توجد عروض حالياً',
        noOffersHint: 'ترقب عروضنا القادمة!',
        specialOffer: 'عرض خاص',
        limitedOffer: 'عرض محدود',
        // Settings
        darkMode: 'الوضع الليلي',
        lightMode: 'الوضع النهاري',
        language: 'اللغة',
        arabic: 'العربية',
        english: 'English',
        appearance: 'المظهر',
        general: 'عام',
    },
    en: {
        dir: 'ltr' as const,
        memberApp: 'Member App',
        welcome: 'Welcome,',
        tabHome: 'Home',
        tabOffers: 'Offers',
        tabSubs: 'Subscriptions',
        tabProfile: 'Profile',
        activeSub: 'Active Subscription',
        active: 'Active',
        remaining: 'Remaining',
        day: 'day',
        days: 'days',
        noActiveSub: 'No active subscription',
        noActiveSubHint: 'Contact club management to renew',
        yourSubs: 'Subscriptions',
        monthAttendance: 'This Month',
        totalVisits: 'Total Visits',
        recentVisits: 'Recent Visits',
        record: 'record',
        visit: 'Visit',
        noAttendance: 'No attendance records',
        mySubs: 'My Subscriptions',
        startDate: 'Start',
        endDate: 'End',
        amount: 'Amount',
        sar: 'SAR',
        noSubs: 'No subscriptions',
        frozen: 'Frozen',
        expired: 'Expired',
        nationalId: 'National ID',
        phone: 'Phone',
        email: 'Email',
        status: 'Status',
        logout: 'Logout',
        clubOffers: 'Club Offers',
        currentOffers: 'Current Offers',
        discount: 'Discount',
        extraDays: 'Extra Days',
        pauseAllowed: 'Pause allowed',
        pauseNotAllowed: 'No pause',
        contactClub: 'Contact the club to benefit',
        noOffers: 'No offers available',
        noOffersHint: 'Stay tuned for upcoming offers!',
        specialOffer: 'Special Offer',
        limitedOffer: 'Limited Offer',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        language: 'Language',
        arabic: 'العربية',
        english: 'English',
        appearance: 'Appearance',
        general: 'General',
    }
};

type Lang = 'ar' | 'en';
type TabId = 'home' | 'offers' | 'subs' | 'profile';

export default function MemberDashboard() {
    const router = useRouter();
    const [member, setMember] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [clubName, setClubName] = useState('');
    const [activeTab, setActiveTab] = useState<TabId>('home');
    const [lang, setLang] = useState<Lang>('ar');
    const [isDark, setIsDark] = useState(true);

    const t = translations[lang];

    useEffect(() => {
        // Restore preferences
        const savedLang = localStorage.getItem('member_lang') as Lang;
        const savedTheme = localStorage.getItem('member_theme');
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) setLang(savedLang);
        if (savedTheme === 'light') setIsDark(false);

        const session = localStorage.getItem('member_session');
        if (!session) {
            router.push('/member/login');
            return;
        }
        const memberData = JSON.parse(session);
        setMember(memberData);
        loadMemberData(memberData);
    }, []);

    const toggleDark = () => {
        setIsDark(prev => {
            localStorage.setItem('member_theme', !prev ? 'dark' : 'light');
            return !prev;
        });
    };

    const toggleLang = () => {
        setLang(prev => {
            const next = prev === 'ar' ? 'en' : 'ar';
            localStorage.setItem('member_lang', next);
            return next;
        });
    };

    async function loadMemberData(memberData: any) {
        try {
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('member_id', memberData.id);

            const { data: prices } = await supabase
                .from('subscription_prices')
                .select('id, subscription_name, price');

            const { data: types } = await supabase
                .from('subscription_types')
                .select('id, name, duration_days');

            const { data: activities } = await supabase
                .from('activities')
                .select('id, name');

            const { data: att } = await supabase
                .from('attendance')
                .select('*')
                .eq('member_id', memberData.id)
                .order('created_at', { ascending: false })
                .limit(30);

            // Load club promotions (active ones for member's club)
            const { data: promos } = await supabase
                .from('promotions')
                .select('*')
                .eq('club_id', memberData.clubId)
                .eq('status', 'نشط');

            if (memberData.clubId) {
                const { data: club } = await supabase
                    .from('clubs')
                    .select('name')
                    .eq('id', memberData.clubId)
                    .single();
                if (club) setClubName(club.name);
            }

            const enrichedSubs = (subs || []).map((sub: any) => {
                const price = prices?.find((p: any) => p.id === sub.price_id);
                const type = types?.find((t: any) => t.id === sub.type_id);
                const activity = activities?.find((a: any) => a.id === sub.activity_id);
                return {
                    ...sub,
                    priceName: price?.subscription_name || (lang === 'ar' ? 'اشتراك' : 'Subscription'),
                    priceAmount: price?.price || sub.total_amount,
                    typeName: type?.name || '',
                    durationDays: type?.duration_days || 0,
                    activityName: activity?.name || ''
                };
            });

            setSubscriptions(enrichedSubs);
            setAttendance(att || []);
            setPromotions(promos || []);
        } catch (error) {
            console.error('Error loading member data:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('member_session');
        router.push('/member/login');
    };

    const getStatusBadge = (sub: any) => {
        const today = new Date().toISOString().split('T')[0];
        if (sub.status === 'مجمد' || sub.status === 'موقف') {
            return { label: t.frozen, color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: <PauseCircle className="w-3 h-3" /> };
        }
        if (sub.end_date < today) {
            return { label: t.expired, color: 'bg-rose-500/15 text-rose-400 border-rose-500/20', icon: <XCircle className="w-3 h-3" /> };
        }
        return { label: t.active, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> };
    };

    const getActiveSubscription = () => {
        const today = new Date().toISOString().split('T')[0];
        return subscriptions.find(s => s.end_date >= today && s.status !== 'مجمد' && s.status !== 'موقف');
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const today = new Date();
        return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    };

    const getSubscriptionProgress = (startDate: string, endDate: string) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const now = Date.now();
        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    // ─── Theme classes ──────────────────────────────────────────────────
    const bg = isDark ? 'bg-slate-950' : 'bg-gray-50';
    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-white/30' : 'text-gray-500';
    const textMuted = isDark ? 'text-white/15' : 'text-gray-400';
    const textSoft = isDark ? 'text-white/50' : 'text-gray-600';
    const textLabel = isDark ? 'text-white/20' : 'text-gray-400';
    const cardBg = isDark ? 'bg-white/[0.03]' : 'bg-white';
    const cardBorder = isDark ? 'border-white/[0.06]' : 'border-gray-200';
    const navBg = isDark ? 'bg-slate-950/95' : 'bg-white/95';
    const navBorder = isDark ? 'border-white/[0.05]' : 'border-gray-200';
    const navInactive = isDark ? 'text-white/20' : 'text-gray-400';
    const navInactiveHover = isDark ? 'hover:text-white/40' : 'hover:text-gray-600';
    const statusBg = isDark ? 'bg-slate-950' : 'bg-white';
    const inputBg = isDark ? 'bg-white/[0.02]' : 'bg-gray-50';
    const inputBorder = isDark ? 'border-white/[0.04]' : 'border-gray-100';

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${bg} font-['Tajawal',_sans-serif]`}>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }
    if (!member) return null;

    const activeSub = getActiveSubscription();
    const thisMonthAttendance = attendance.filter(a => {
        const aDate = new Date(a.date || a.created_at);
        const now = new Date();
        return aDate.getMonth() === now.getMonth() && aDate.getFullYear() === now.getFullYear();
    }).length;

    const offerIcons = [
        <Flame key="flame" className="w-6 h-6" />,
        <Zap key="zap" className="w-6 h-6" />,
        <Star key="star" className="w-6 h-6" />,
        <Gift key="gift" className="w-6 h-6" />,
        <Trophy key="trophy" className="w-6 h-6" />,
    ];
    const offerGradients = [
        'from-orange-500 to-rose-500',
        'from-violet-500 to-fuchsia-500',
        'from-cyan-500 to-blue-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-yellow-500',
    ];

    return (
        <div className={`min-h-screen ${bg} font-['Tajawal',_sans-serif] ${textPrimary} transition-colors duration-300`} dir={t.dir}>
            {/* ─── Status bar ─────────────────────── */}
            <div className={`${statusBg} px-6 py-3 flex items-center justify-between ${textSecondary} text-[10px] font-bold sticky top-0 z-50 transition-colors duration-300 border-b ${isDark ? 'border-white/[0.03]' : 'border-gray-100'}`}>
                <span className="font-black">{clubName || 'Fitness Club'}</span>
                <div className="flex items-center gap-3">
                    {/* Language toggle */}
                    <button onClick={toggleLang} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-all`} title={t.language}>
                        <Languages className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase">{lang === 'ar' ? 'EN' : 'ع'}</span>
                    </button>
                    {/* Theme toggle */}
                    <button onClick={toggleDark} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-amber-400/60' : 'hover:bg-gray-100 text-indigo-500/70'} transition-all`} title={isDark ? t.lightMode : t.darkMode}>
                        {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </button>
                    {/* Logout */}
                    <button onClick={handleLogout} className="text-rose-400/50 hover:text-rose-400 transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ─── Main Content Area ─────────────── */}
            <div className="pb-24 px-5">
                <AnimatePresence mode="wait">
                    {/* ═══════════════════════ HOME TAB ═══════════════════════ */}
                    {activeTab === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                            {/* Welcome Header */}
                            <div className="pt-4 pb-2">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border ${isDark ? 'border-white/10' : 'border-blue-200'} flex items-center justify-center shrink-0 shadow-xl`}>
                                        {member.photo ? (
                                            <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                                        ) : (
                                            <span className="text-2xl font-black text-blue-400">{member.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xl font-extrabold">{t.welcome} {member.name.split(' ')[0]}</h1>
                                            {member.vip && <Crown className="w-4 h-4 text-amber-400" />}
                                        </div>
                                        <p className={`${textSecondary} text-[11px] font-bold mt-0.5`}>
                                            #{member.membershipNumber} • {clubName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Active Subscription Card */}
                            {activeSub ? (
                                <div className={`bg-gradient-to-br ${isDark ? 'from-blue-600/20 to-indigo-600/15' : 'from-blue-50 to-indigo-50'} rounded-3xl p-5 border ${isDark ? 'border-blue-500/15' : 'border-blue-200'} relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] -mr-20 -mt-20" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Dumbbell className="w-4 h-4 text-blue-400" />
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t.activeSub}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 rounded-full border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-400">{t.active}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-extrabold mb-1">{activeSub.priceName}</h3>
                                        <p className={`${textSecondary} text-[11px] font-bold mb-4`}>{activeSub.activityName} • {activeSub.typeName}</p>
                                        <div className="mb-3">
                                            <div className={`flex items-center justify-between text-[10px] font-bold ${textSecondary} mb-1.5`}>
                                                <span>{activeSub.start_date}</span>
                                                <span>{activeSub.end_date}</span>
                                            </div>
                                            <div className={`h-2 ${isDark ? 'bg-white/[0.06]' : 'bg-blue-100'} rounded-full overflow-hidden`}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${getSubscriptionProgress(activeSub.start_date, activeSub.end_date)}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[11px] font-bold ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{t.remaining}</span>
                                            <span className="text-lg font-extrabold text-blue-400">
                                                {getDaysRemaining(activeSub.end_date)} <span className={`text-[11px] ${textSecondary}`}>{t.days}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`${cardBg} rounded-3xl p-6 border ${cardBorder} text-center`}>
                                    <CreditCard className={`w-8 h-8 ${textMuted} mx-auto mb-3`} />
                                    <p className={`${textSecondary} text-sm font-bold`}>{t.noActiveSub}</p>
                                    <p className={`${textMuted} text-[10px] font-bold mt-1`}>{t.noActiveSubHint}</p>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: <CalendarDays className="w-5 h-5 text-blue-400/60" />, val: subscriptions.length, label: t.yourSubs },
                                    { icon: <Activity className="w-5 h-5 text-emerald-400/60" />, val: thisMonthAttendance, label: t.monthAttendance },
                                    { icon: <TrendingUp className="w-5 h-5 text-amber-400/60" />, val: attendance.length, label: t.totalVisits },
                                ].map((s, i) => (
                                    <div key={i} className={`${cardBg} rounded-2xl p-4 border ${cardBorder} text-center transition-colors duration-300`}>
                                        <div className="mx-auto mb-2 flex justify-center">{s.icon}</div>
                                        <div className="text-xl font-extrabold">{s.val}</div>
                                        <div className={`text-[9px] font-bold ${textLabel} uppercase tracking-wider`}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Offers preview (if any) */}
                            {promotions.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-orange-400" />
                                            <h3 className={`text-sm font-extrabold ${textSoft}`}>{t.clubOffers}</h3>
                                        </div>
                                        <button onClick={() => setActiveTab('offers')} className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors">
                                            {lang === 'ar' ? 'عرض الكل' : 'View All'} →
                                        </button>
                                    </div>
                                    <div className={`bg-gradient-to-r ${offerGradients[0]} rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white shrink-0">
                                            {offerIcons[0]}
                                        </div>
                                        <div className="relative z-10 flex-1 min-w-0">
                                            <div className="text-white text-sm font-extrabold truncate">{promotions[0].name}</div>
                                            <div className="text-white/70 text-[10px] font-bold mt-0.5">{t.discount}: {promotions[0].discount_percent}%</div>
                                        </div>
                                        <div className="relative z-10 text-white/40 shrink-0">
                                            <ChevronLeft className={`w-5 h-5 ${lang === 'ar' ? '' : 'rotate-180'}`} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Attendance */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm font-extrabold ${textSoft}`}>{t.recentVisits}</h3>
                                    <span className={`text-[10px] font-bold ${textLabel}`}>{attendance.length} {t.record}</span>
                                </div>
                                {attendance.length > 0 ? (
                                    <div className="space-y-2">
                                        {attendance.slice(0, 5).map((att, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-3 ${inputBg} rounded-xl border ${inputBorder} transition-colors duration-300`}>
                                                <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-blue-600/10 text-blue-400/60' : 'bg-blue-50 text-blue-500'} flex items-center justify-center shrink-0`}>
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-[11px] font-bold ${textSoft} truncate`}>{att.plan_name || att.type || t.visit}</div>
                                                    <div className={`text-[9px] font-bold ${textLabel}`}>{att.day_of_week}</div>
                                                </div>
                                                <div className={`${lang === 'ar' ? 'text-left' : 'text-right'} shrink-0`}>
                                                    <div className={`text-[10px] font-bold ${textSecondary} font-mono`}>{att.date}</div>
                                                    <div className={`text-[9px] font-bold ${textMuted}`}>{att.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-8 ${textMuted} text-[11px] font-bold`}>{t.noAttendance}</div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════ OFFERS TAB ═══════════════════════ */}
                    {activeTab === 'offers' && (
                        <motion.div key="offers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5 pt-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold">{t.clubOffers}</h2>
                                    <p className={`text-[11px] font-bold ${textSecondary}`}>{t.currentOffers}</p>
                                </div>
                            </div>

                            {/* Offers List */}
                            {promotions.length > 0 ? (
                                <div className="space-y-4">
                                    {promotions.map((promo, i) => {
                                        const gradient = offerGradients[i % offerGradients.length];
                                        const icon = offerIcons[i % offerIcons.length];
                                        return (
                                            <motion.div
                                                key={promo.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden transition-colors duration-300`}
                                            >
                                                {/* Offer Header with gradient */}
                                                <div className={`bg-gradient-to-r ${gradient} p-5 relative overflow-hidden`}>
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-10 -mt-10" />
                                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-[30px] -ml-8 -mb-8" />
                                                    <div className="relative z-10 flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white shadow-inner">
                                                                {icon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                                                                        {t.specialOffer}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-lg font-extrabold text-white leading-tight">{promo.name}</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Offer Details */}
                                                <div className="p-5 space-y-4">
                                                    {/* Main stats */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Discount */}
                                                        <div className={`${inputBg} rounded-2xl p-4 border ${inputBorder} text-center transition-colors duration-300`}>
                                                            <Percent className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                                                            <div className="text-2xl font-extrabold text-emerald-400">{promo.discount_percent}%</div>
                                                            <div className={`text-[9px] font-black ${textLabel} uppercase tracking-wider mt-1`}>{t.discount}</div>
                                                        </div>
                                                        {/* Extra Days */}
                                                        <div className={`${inputBg} rounded-2xl p-4 border ${inputBorder} text-center transition-colors duration-300`}>
                                                            <CalendarDays className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                                                            <div className="text-2xl font-extrabold text-blue-400">+{promo.extra_days || 0}</div>
                                                            <div className={`text-[9px] font-black ${textLabel} uppercase tracking-wider mt-1`}>{t.extraDays}</div>
                                                        </div>
                                                    </div>

                                                    {/* Freeze badge */}
                                                    <div className={`flex items-center gap-2 p-3 rounded-xl ${promo.accept_pause
                                                        ? (isDark ? 'bg-emerald-500/10 border-emerald-500/15' : 'bg-emerald-50 border-emerald-200')
                                                        : (isDark ? 'bg-rose-500/10 border-rose-500/15' : 'bg-rose-50 border-rose-200')
                                                        } border transition-colors duration-300`}>
                                                        {promo.accept_pause
                                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                            : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                                        }
                                                        <span className={`text-[11px] font-bold ${promo.accept_pause ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            {promo.accept_pause ? t.pauseAllowed : t.pauseNotAllowed}
                                                        </span>
                                                    </div>

                                                    {/* CTA hint */}
                                                    <p className={`text-[10px] font-bold ${textSecondary} text-center`}>{t.contactClub}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={`${cardBg} rounded-3xl p-10 border ${cardBorder} text-center transition-colors duration-300`}>
                                    <div className={`w-16 h-16 mx-auto mb-4 rounded-3xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'} flex items-center justify-center`}>
                                        <Tag className={`w-8 h-8 ${textMuted}`} />
                                    </div>
                                    <p className={`${textSecondary} text-sm font-bold`}>{t.noOffers}</p>
                                    <p className={`${textMuted} text-[10px] font-bold mt-1`}>{t.noOffersHint}</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════════════════════ SUBS TAB ═══════════════════════ */}
                    {activeTab === 'subs' && (
                        <motion.div key="subs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                            <h2 className="text-lg font-extrabold">{t.mySubs}</h2>
                            {subscriptions.length > 0 ? subscriptions.map((sub, i) => {
                                const status = getStatusBadge(sub);
                                return (
                                    <div key={i} className={`${cardBg} rounded-2xl p-4 border ${cardBorder} transition-colors duration-300`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-sm font-extrabold">{sub.priceName}</h4>
                                                <p className={`text-[10px] font-bold ${textLabel} mt-0.5`}>{sub.activityName} • {sub.typeName}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-black ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className={`${inputBg} rounded-xl p-2 border ${inputBorder} transition-colors duration-300`}>
                                                <div className={`text-[9px] font-bold ${textLabel} mb-1`}>{t.startDate}</div>
                                                <div className={`text-[10px] font-bold ${textSoft} font-mono`}>{sub.start_date}</div>
                                            </div>
                                            <div className={`${inputBg} rounded-xl p-2 border ${inputBorder} transition-colors duration-300`}>
                                                <div className={`text-[9px] font-bold ${textLabel} mb-1`}>{t.endDate}</div>
                                                <div className={`text-[10px] font-bold ${textSoft} font-mono`}>{sub.end_date}</div>
                                            </div>
                                            <div className={`${inputBg} rounded-xl p-2 border ${inputBorder} transition-colors duration-300`}>
                                                <div className={`text-[9px] font-bold ${textLabel} mb-1`}>{t.amount}</div>
                                                <div className="text-[10px] font-extrabold text-blue-400">{sub.priceAmount || sub.total_amount} {t.sar}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className={`text-center py-16 ${textMuted}`}>
                                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-bold">{t.noSubs}</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════════════════════ PROFILE TAB ═══════════════════════ */}
                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5 pt-4">
                            {/* Profile Card */}
                            <div className="text-center">
                                <div className={`w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-2 ${isDark ? 'border-white/10' : 'border-blue-200'} flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                                    {member.photo ? (
                                        <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                                    ) : (
                                        <span className="text-3xl font-black text-blue-400">{member.name.charAt(0)}</span>
                                    )}
                                </div>
                                <h2 className="text-xl font-extrabold mb-1">{member.name}</h2>
                                <div className={`flex items-center justify-center gap-2 ${textLabel} text-[11px] font-bold`}>
                                    <span>#{member.membershipNumber}</span>
                                    {member.vip && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 rounded-full border border-amber-500/20">
                                            <Crown className="w-3 h-3 text-amber-400" />
                                            <span className="text-[9px] font-black text-amber-400">VIP</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-2">
                                {[
                                    { label: t.nationalId, value: member.nationalId, icon: <Shield className="w-4 h-4" /> },
                                    { label: t.phone, value: member.phone, icon: <User className="w-4 h-4" /> },
                                    { label: t.email, value: member.email || '—', icon: <Settings className="w-4 h-4" /> },
                                    { label: t.status, value: member.status || t.active, icon: <Activity className="w-4 h-4" /> },
                                ].map((row, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3.5 ${inputBg} rounded-xl border ${inputBorder} transition-colors duration-300`}>
                                        <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-blue-600/10 text-blue-400/40' : 'bg-blue-50 text-blue-500'} flex items-center justify-center shrink-0`}>
                                            {row.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-[9px] font-bold ${textLabel} uppercase tracking-wider`}>{row.label}</div>
                                            <div className={`text-[12px] font-bold ${textSoft}`}>{row.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Appearance & Language Settings */}
                            <div className={`${cardBg} rounded-2xl border ${cardBorder} overflow-hidden transition-colors duration-300`}>
                                <div className={`px-4 py-3 text-[10px] font-black ${textLabel} uppercase tracking-widest border-b ${inputBorder}`}>
                                    {t.general}
                                </div>
                                {/* Dark / Light */}
                                <button onClick={toggleDark} className={`w-full flex items-center gap-3 p-4 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} transition-colors border-b ${inputBorder}`}>
                                    <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-50 text-indigo-500'} flex items-center justify-center shrink-0`}>
                                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    </div>
                                    <div className={`flex-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                        <div className={`text-[12px] font-bold ${textSoft}`}>{t.appearance}</div>
                                        <div className={`text-[10px] font-bold ${textLabel}`}>{isDark ? t.darkMode : t.lightMode}</div>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full transition-all relative ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isDark ? (lang === 'ar' ? 'left-1' : 'right-1') : (lang === 'ar' ? 'right-1' : 'left-1')}`} />
                                    </div>
                                </button>
                                {/* Language */}
                                <button onClick={toggleLang} className={`w-full flex items-center gap-3 p-4 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'} transition-colors`}>
                                    <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-500'} flex items-center justify-center shrink-0`}>
                                        <Languages className="w-4 h-4" />
                                    </div>
                                    <div className={`flex-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                        <div className={`text-[12px] font-bold ${textSoft}`}>{t.language}</div>
                                        <div className={`text-[10px] font-bold ${textLabel}`}>{lang === 'ar' ? t.arabic : t.english}</div>
                                    </div>
                                    <span className={`text-[11px] font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{lang === 'ar' ? 'EN' : 'ع'}</span>
                                </button>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 border border-rose-500/15 transition-all active:scale-[0.98]"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>{t.logout}</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Bottom Navigation Bar ──────────── */}
            <div className={`fixed bottom-0 left-0 right-0 ${navBg} backdrop-blur-xl border-t ${navBorder} px-4 py-3 z-50 transition-colors duration-300`}>
                <div className="max-w-md mx-auto flex items-center justify-around">
                    {([
                        { id: 'home' as TabId, icon: <Dumbbell className="w-5 h-5" />, label: t.tabHome },
                        { id: 'offers' as TabId, icon: <Tag className="w-5 h-5" />, label: t.tabOffers, badge: promotions.length },
                        { id: 'subs' as TabId, icon: <CreditCard className="w-5 h-5" />, label: t.tabSubs },
                        { id: 'profile' as TabId, icon: <User className="w-5 h-5" />, label: t.tabProfile },
                    ]).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${activeTab === tab.id
                                ? 'text-blue-400'
                                : `${navInactive} ${navInactiveHover}`
                                }`}
                        >
                            <div className="relative">
                                {tab.icon}
                                {tab.badge && tab.badge > 0 && (
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-[7px] font-black text-white">{tab.badge}</span>
                                    </div>
                                )}
                            </div>
                            <span className="text-[9px] font-black">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTabIndicator" className="w-1 h-1 bg-blue-400 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
