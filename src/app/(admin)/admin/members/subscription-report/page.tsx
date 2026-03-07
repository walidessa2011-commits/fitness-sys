"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Activity,
    Dumbbell,
    UserCheck,
    Clock,
    UserX,
    Search,
    Filter,
    ArrowUpRight,
    ArrowRightLeft,
    ChevronRight,
    Calendar,
    Award,
    Download,
    RefreshCw,
    PieChart,
    BarChart3,
    MoreHorizontal,
    Briefcase,
    PlusCircle,
    DollarSign,
    FileSpreadsheet,
    FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function SubscriptionReportPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Data states
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [clubProfile, setClubProfile] = useState<any>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [activityFilter, setActivityFilter] = useState('');
    const [coachFilter, setCoachFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'renewed' | 'paused'>('all');

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadData(currentUser);
    }, [router]);

    const loadData = async (currentUser: User) => {
        setLoading(true);
        try {
            const clubId = currentUser.clubId;
            const [allSubs, allMembers, allActivities, allEmployees, allPrices, allProfiles] = await Promise.all([
                db.getAll('subscriptions'),
                db.getAll('members'),
                db.getAll('activities'),
                db.getAll('employees'),
                db.getAll('subscription_prices'),
                db.getAll('club_profiles')
            ]);

            // Filter by club if not super admin
            const isSuper = currentUser.role === 'super_admin';
            const filteredSubs = isSuper ? allSubs : allSubs.filter((s: any) => s.clubId === clubId || s.club_id === clubId);
            const filteredMembers = isSuper ? allMembers : allMembers.filter((m: any) => m.clubId === clubId || m.club_id === clubId);
            const filteredActivities = isSuper ? allActivities : allActivities.filter((a: any) => a.clubId === clubId || a.club_id === clubId);
            const filteredPrices = isSuper ? allPrices : allPrices.filter((p: any) => p.clubId === clubId || p.club_id === clubId);
            const filteredCoaches = (allEmployees || []).filter((e: any) =>
                (e.jobRole === 'coach' || e.job_role === 'coach') &&
                (isSuper || e.clubId === clubId || e.club_id === clubId)
            );

            // Map subscribers to additional info
            const mappedSubs = filteredSubs.map((s: any) => {
                const member = filteredMembers.find((m: any) => m.id === s.memberId);
                const activity = filteredActivities.find((a: any) => a.id === s.activityId);
                const coach = filteredCoaches.find((c: any) => c.id === s.coachId);
                const priceInfo = filteredPrices.find((p: any) => p.id === s.priceId || p.id === s.price_id);

                // Determine if it's a renewal (simple logic: check if member has subscriptions with earlier createdAt)
                const olderSubs = filteredSubs.filter((os: any) =>
                    os.memberId === s.memberId &&
                    new Date(os.createdAt).getTime() < new Date(s.createdAt).getTime()
                );
                const isRenewal = olderSubs.length > 0;

                // Try to deduce activity name from price if activity record is gone
                const deducedName = activity?.name ||
                    (priceInfo?.subscriptionName ? `${priceInfo.subscriptionName} (نشاط محذوف)` : null) ||
                    `نشاط محذوف (${s.activityId?.substring(0, 8)})`;

                return {
                    ...s,
                    memberName: member?.name || 'عضو غير معروف',
                    membershipNumber: member?.membershipNumber || '---',
                    activityName: deducedName,
                    coachName: coach?.name || '---',
                    isRenewal
                };
            }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setSubscriptions(mappedSubs);
            setMembers(filteredMembers);
            setActivities(filteredActivities);
            setCoaches(filteredCoaches);

            const myProfile = allProfiles?.find((p: any) => p.clubId === clubId);
            setClubProfile(myProfile || null);
            // Save prices if needed later
        } catch (error) {
            console.error("Error loading report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreActivity = async (id: string, deducedName?: string) => {
        if (!user?.clubId) return;
        const nameToUse = deducedName?.split(' (')[0] || 'نشاط مسترجع';
        try {
            await db.add('activities', {
                id: id,
                name: nameToUse,
                status: 'نشط',
                clubId: user.clubId
            });
            alert(`تم استعادة النشاط بنجاح باسم "${nameToUse}"`);
            loadData(user);
        } catch (e) {
            alert('فشل في استعادة النشاط');
        }
    };

    // Calculate stats
    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'نشط').length,
        new: subscriptions.filter(s => !s.isRenewal).length,
        renewed: subscriptions.filter(s => s.isRenewal).length,
        paused: subscriptions.filter(s => s.status === 'موقوف' || s.status === 'موقف مؤقتاً' || s.status === 'موقف').length,
        totalRevenue: subscriptions.reduce((sum, s) => sum + (Number(s.total) || 0), 0)
    };

    // Activity breakdown
    const activityStats = activities.map(a => {
        const count = subscriptions.filter(s => s.activityId === a.id).length;
        const activeCount = subscriptions.filter(s => s.activityId === a.id && s.status === 'نشط').length;
        return { name: a.name, count, activeCount, id: a.id };
    }).sort((a, b) => b.count - a.count);

    // Coach breakdown
    const coachStats = coaches.map(c => {
        const count = subscriptions.filter(s => s.coachId === c.id).length;
        const activeCount = subscriptions.filter(s => s.coachId === c.id && s.status === 'نشط').length;
        return { name: c.name, count, activeCount, id: c.id };
    }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    // Filter results
    const filteredResults = subscriptions.filter(s => {
        const matchSearch = s.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.membershipNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchActivity = !activityFilter || s.activityId === activityFilter;
        const matchCoach = !coachFilter || s.coachId === coachFilter;
        const matchStatus = !statusFilter || s.status === statusFilter;

        let matchTab = true;
        if (activeTab === 'new') matchTab = !s.isRenewal;
        if (activeTab === 'renewed') matchTab = s.isRenewal;
        if (activeTab === 'paused') matchTab = s.status === 'موقوف' || s.status === 'موقف مؤقتاً';

        return matchSearch && matchActivity && matchCoach && matchStatus && matchTab;
    });

    const exportToExcel = () => {
        if (!filteredResults || filteredResults.length === 0) return;

        const headers = ['المشترك', 'رقم العضوية', 'نوع الرياضة', 'المدرب', 'تاريخ النهاية', 'الحالة'];
        const data = filteredResults.map(item => ({
            'المشترك': item.memberName,
            'رقم العضوية': item.membershipNumber || '',
            'نوع الرياضة': item.activityName,
            'المدرب': item.coachName,
            'تاريخ النهاية': item.endDate || '',
            'الحالة': item.status || 'نشط'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions Report");
        XLSX.writeFile(workbook, `subscriptions-report.xlsx`);
    };

    const exportToPDF = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            <div className="flex flex-col gap-6 print:hidden">

                {/* Header Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">تقرير وتحليل الاشتراكات</h1>
                            <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                إحصائيات شاملة وتفصيلية لحالة العضويات
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                        <button
                            onClick={() => loadData(user!)}
                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-blue-600 transition-all active:scale-95 border border-slate-300 dark:border-slate-700"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex gap-2 no-print">
                            <button
                                onClick={exportToPDF}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-rose-500/10 transition-all flex items-center gap-2 active:scale-95 group"
                            >
                                <FileDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                <span>استخراج PDF</span>
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 active:scale-95 group"
                            >
                                <FileSpreadsheet className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                <span>استخراج Excel</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="إجمالي الاشتراكات" value={stats.total} icon={<TrendingUp className="w-5 h-5" />} color="indigo" />
                    <StatCard label="المشتركين النشطين" value={stats.active} icon={<UserCheck className="w-5 h-5" />} color="emerald" />
                    <StatCard label="اشتراكات جديدة" value={stats.new} icon={<ArrowUpRight className="w-5 h-5" />} color="blue" />
                    <StatCard label="اشتراكات مجددة" value={stats.renewed} icon={<ArrowRightLeft className="w-5 h-5" />} color="amber" />
                    <StatCard label="عضويات موقوفة" value={stats.paused} icon={<UserX className="w-5 h-5" />} color="rose" />
                    <StatCard label="إجمالي الإيرادات" value={`${stats.totalRevenue.toLocaleString()} ريال`} icon={<DollarSign className="w-5 h-5" />} color="emerald" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Sports/Activities Breakdown */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-300 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4 text-indigo-500" /> توزيع الرياضات
                                </h3>
                                <PieChart className="w-4 h-4 text-gray-300" />
                            </div>

                            <div className="space-y-3">
                                {activityStats.length > 0 ? activityStats.map((item, idx) => (
                                    <div key={item.id} className="group flex flex-col gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${idx === 0 ? 'bg-indigo-600 text-white' :
                                                    idx === 1 ? 'bg-emerald-500 text-white' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <span className="text-xs font-black text-gray-700 dark:text-slate-300">{item.name}</span>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[14px] font-black text-indigo-600 dark:text-indigo-400">{item.count}</div>
                                                <div className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400">{item.activeCount} نشط</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / stats.total) * 100}%` }}
                                                className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center opacity-20 italic text-xs font-bold">لا يوجد بيانات حالية</div>
                                )}
                            </div>
                        </div>

                        {/* Coach Breakdown */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-300 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" /> تحليل أداء المدربين
                                </h3>
                                <Users className="w-4 h-4 text-gray-300" />
                            </div>
                            <div className="space-y-4">
                                {coachStats.length > 0 ? coachStats.map((coach, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                <span className="text-[11px] font-black text-gray-700 dark:text-slate-300">{coach.name}</span>
                                            </div>
                                            <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{coach.count} عضو</div>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(coach.count / stats.total) * 100}%` }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[8px] font-bold text-gray-400 px-1 italic">
                                            <span>نشط: {coach.activeCount}</span>
                                            <span>{((coach.count / stats.total) * 100).toFixed(1)}% من الإجمالي</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-6 text-center text-gray-300 text-[10px] italic">لا توجد بيانات مدربين حالياً</div>
                                )}
                            </div>
                        </div>

                        {/* Paused Quick List */}
                        <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-[2.5rem] p-6 border border-rose-100/50 dark:border-rose-900/20">
                            <div className="flex items-center gap-2 mb-4">
                                <UserX className="w-4 h-4 text-rose-500" />
                                <h3 className="text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">المشتركين الموقوفين ({stats.paused})</h3>
                            </div>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                {subscriptions.filter(s => s.status === 'موقوف' || s.status === 'موقف مؤقتاً' || s.status === 'موقف').length > 0 ? (
                                    subscriptions.filter(s => s.status === 'موقوف' || s.status === 'موقف مؤقتاً' || s.status === 'موقف').map((s: any) => (
                                        <div key={s.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-rose-50 dark:border-rose-900/20">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 text-[10px] font-black">
                                                    {s.memberName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-700 dark:text-slate-300">{s.memberName}</span>
                                                    <span className="text-[8px] font-bold text-gray-400 italic">{s.activityName}</span>
                                                </div>
                                            </div>
                                            <div className="text-[8px] font-black text-rose-500 font-mono">
                                                {s.endDate}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-gray-300 text-[10px] italic font-bold">كل العضويات نشطة حالياً</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Detailed List */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">

                            {/* Tabs for fast filtering */}
                            <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
                                <TabBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="الكل" count={stats.total} />
                                <TabBtn active={activeTab === 'new'} onClick={() => setActiveTab('new')} label="جديد" icon={<TrendingUp className="w-3 h-3" />} color="text-blue-500" />
                                <TabBtn active={activeTab === 'renewed'} onClick={() => setActiveTab('renewed')} label="مجدد" icon={<ArrowRightLeft className="w-3 h-3" />} color="text-amber-500" />
                                <TabBtn active={activeTab === 'paused'} onClick={() => setActiveTab('paused')} label="الموقفين" icon={<UserX className="w-3 h-3" />} color="text-rose-500" count={stats.paused} />
                            </div>

                            {/* Filters Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                <div className="relative col-span-1">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                    <input
                                        type="text"
                                        placeholder="ابحث بالاسم أو رقم العضوية..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-9 pl-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-transparent focus:border-blue-500/30 rounded-xl text-xs font-bold outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <select
                                    value={activityFilter}
                                    onChange={(e) => setActivityFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-transparent rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-blue-500/30 dark:text-white"
                                >
                                    <option value="">كل الرياضات</option>
                                    {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select
                                    value={coachFilter}
                                    onChange={(e) => setCoachFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800 border border-transparent rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-blue-500/30 dark:text-white"
                                >
                                    <option value="">كل المدربين</option>
                                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Results Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[10px] font-black uppercase tracking-widest h-10">
                                        <tr>
                                            <th className="px-6 py-2 first:rounded-tr-2xl border-l border-white/5 last:border-l-0">المشترك</th>
                                            <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">نوع الرياضة</th>
                                            <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">المدرب</th>
                                            <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">تاريخ النهاية</th>
                                            <th className="px-4 py-2 text-center last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                                    <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mx-auto opacity-10" />
                                                </td>
                                            </tr>
                                        ) : filteredResults.length > 0 ? (
                                            filteredResults.map((sub) => (
                                                <tr key={sub.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all cursor-pointer">
                                                    <td className="px-6 py-3 border-l border-gray-100/20 last:border-l-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 group-hover:scale-110 transition-transform">
                                                                {sub.memberName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                    {sub.memberName}
                                                                    {sub.isRenewal ? (
                                                                        <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/20 text-[7px] px-1 rounded uppercase font-black">مجدد</span>
                                                                    ) : (
                                                                        <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 text-[7px] px-1 rounded uppercase font-black">جديد</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-gray-400 mt-0.5">#{sub.membershipNumber}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center border-l border-gray-100/20 last:border-l-0">
                                                        {sub.activityName.startsWith('نشاط محذوف') ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                                                    {sub.activityName}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRestoreActivity(sub.activityId, sub.activityName);
                                                                    }}
                                                                    className="text-[8px] font-black text-indigo-600 hover:underline flex items-center gap-1"
                                                                >
                                                                    <PlusCircle className="w-2 h-2" /> استعادة النشاط
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/40">
                                                                {sub.activityName}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center border-l border-gray-100/20 last:border-l-0">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">{sub.coachName}</span>
                                                            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">مدرب</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-black text-[10px] font-mono text-gray-500 dark:text-slate-500 border-l border-gray-100/20 last:border-l-0">
                                                        {sub.endDate}
                                                    </td>
                                                    <td className="px-4 py-3 text-center border-l border-gray-100/20 last:border-l-0">
                                                        <StatusBadge status={sub.status} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-32 text-center border-l border-gray-100/20 last:border-l-0">
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <Search className="w-12 h-12" />
                                                        <p className="text-sm italic">لا توجد نتائج مطابقة لفلتر البحث</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable Report Layout */}
            <div className="hidden print:block bg-white text-black rtl w-full" dir="rtl">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4">
                    <div className="flex-1 text-right">
                        <h1 className="text-xl font-black mb-1">{clubProfile?.nameAr || clubProfile?.name_ar || (user as any)?.clubName || 'تقرير النادي'}</h1>
                        <p className="text-[11px] font-bold text-slate-500 mb-0.5">تقرير: تقرير الاشتراكات</p>
                        <p className="text-[10px] font-bold text-slate-400">الاستخراج: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}</p>
                    </div>
                    {clubProfile?.logoUrl || clubProfile?.logo_url ? (
                        <img src={clubProfile.logoUrl || clubProfile.logo_url} className="w-16 h-16 object-contain" alt="Logo" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-black text-xl rounded-xl">FC</div>
                    )}
                </div>

                <div className="mb-4 grid grid-cols-4 gap-2">
                    <div className="p-2 border border-slate-200 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي الاشتراكات</p>
                        <p className="text-sm font-black">{stats.total}</p>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">النشطين</p>
                        <p className="text-sm font-black">{stats.active}</p>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">الموقوفين</p>
                        <p className="text-sm font-black">{stats.paused}</p>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي الإيرادات</p>
                        <p className="text-sm font-black">{stats.totalRevenue.toLocaleString()} ريال</p>
                    </div>
                </div>

                <table className="w-full text-right border-separate border-spacing-0 border border-slate-300">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">المشترك</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">رقم العضوية</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">نوع الرياضة</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">المدرب</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">تاريخ النهاية</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResults?.map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold">{item.memberName}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-black text-center">#{item.membershipNumber}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.activityName}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.coachName}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-black text-center" dir="ltr">{item.endDate}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-8 text-center text-[9px] font-bold text-slate-400">
                    <p>هذا التقرير مستخرج من نظام {clubProfile?.nameAr || (user as any)?.clubName || 'إدارة النادي الرياضي'}</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .animate-in, .animate-pulse {
                        animation: none !important;
                    }
                    * {
                        color: black !important;
                        border-color: #ddd !important;
                    }
                }
            `}</style>
        </div >
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/10 dark:border-indigo-900/30 dark:text-indigo-400',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400',
        blue: 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400',
        rose: 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400',
        amber: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-4 rounded-[2rem] border shadow-sm transition-all flex flex-col gap-3 relative overflow-hidden group ${colors[color]}`}
        >
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900/50 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                    {icon}
                </div>
                <MoreHorizontal className="w-4 h-4 opacity-20" />
            </div>
            <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 decoration-slate-300">{label}</span>
                <div className="text-2xl font-black mt-1">{value.toLocaleString()}</div>
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-1 opacity-20 ${color === 'indigo' ? 'bg-indigo-600' : color === 'emerald' ? 'bg-emerald-500' : 'bg-current'}`}></div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'نشط') return <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 text-[9px] px-2 py-0.5 rounded-full font-black border border-emerald-100 dark:border-emerald-900/30">نشط</span>;
    if (status === 'موقوف' || status === 'موقف مؤقتاً' || status === 'موقف') return <span className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 text-[9px] px-2 py-0.5 rounded-full font-black border border-rose-100 dark:border-rose-900/30">موقف</span>;
    if (status === 'ملغي') return <span className="bg-slate-50 text-slate-400 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-full font-black border border-slate-300 dark:border-slate-700">ملغي</span>;
    return <span className="text-[9px] font-black opacity-40">{status}</span>;
}

function TabBtn({ active, onClick, label, icon, count, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${active
                ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
        >
            {icon && <span className={`${active ? color : ''}`}>{icon}</span>}
            <span>{label}</span>
            {count !== undefined && <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{count}</span>}
        </button>
    );
}
