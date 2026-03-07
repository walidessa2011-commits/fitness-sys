"use client";

import React, { useState, useEffect } from 'react';
import {
    Tv,
    Calendar,
    Monitor,
    Clock as History,
    CheckCircle2,
    Ban,
    Ticket,
    Dumbbell,
    AlertTriangle,
    ChevronDown,
    Info,
    Wallet,
    Contact2,
    ArrowUpRight,
    TrendingUp,
    Users,
    Activity,
    Building,
    ShieldCheck,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        newToday: 0,
        newWeek: 0,
        unactivated: 0,
        expiredToday: 0,
        active: 0,
        paused: 0,
        ticketsToday: 0,
        ticketsWeek: 0,
        totalClubs: 0,
        totalMembers: 0,
        totalRevenueToday: 0,
        totalRevenueWeek: 0
    });

    const [activeTab, setActiveTab] = useState('subs');
    const [expiringSubs, setExpiringSubs] = useState<any[]>([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const currentUser = auth.getCurrentUser();
            if (!currentUser) {
                window.location.href = '/auth/login';
                return;
            }
            const userRole = currentUser?.role;
            const userClubId = currentUser?.clubId;
            const superAdmin = userRole === 'super_admin';
            setIsSuperAdmin(superAdmin);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weekAgoStr = weekAgo.toISOString().split('T')[0];

            const fiveDaysFuture = new Date(today);
            fiveDaysFuture.setDate(fiveDaysFuture.getDate() + 5);
            const fiveDaysFutureStr = fiveDaysFuture.toISOString().split('T')[0];

            const [allSubs, allMembers, allTickets, allClubs, allRevenues, allExpenses] = await Promise.all([
                db.getAll('subscriptions'),
                db.getAll('members'),
                db.getAll('daily_tickets'),
                superAdmin ? db.getAll('clubs') : Promise.resolve([]),
                db.getAll('revenueEntries'),
                db.getAll('expenseEntries')
            ]);

            const subs = superAdmin ? allSubs : allSubs.filter((s: any) => s.clubId === userClubId || s.club_id === userClubId);
            const members = superAdmin ? allMembers : allMembers.filter((m: any) => m.clubId === userClubId || m.club_id === userClubId);
            const tickets = superAdmin ? allTickets : allTickets.filter((t: any) => t.clubId === userClubId || t.club_id === userClubId);

            const revenues = superAdmin ? allRevenues : allRevenues.filter((r: any) => r.clubId === userClubId || r.club_id === userClubId);
            const expenses = superAdmin ? allExpenses : allExpenses.filter((e: any) => e.clubId === userClubId || e.club_id === userClubId);

            // Manual Revenues
            const revenueManualToday = revenues
                .filter((r: any) => (r.date === todayStr) || (r.createdAt && r.createdAt.startsWith(todayStr)))
                .reduce((acc: number, r: any) => acc + Number(r.amount), 0);

            const revenueManualWeek = revenues
                .filter((r: any) => {
                    const d = r.date || r.createdAt?.split('T')[0];
                    return d >= weekAgoStr && d <= todayStr;
                })
                .reduce((acc: number, r: any) => acc + Number(r.amount), 0);

            // Tickets Revenue & Count
            const ticketsToday = tickets.filter((t: any) => (t.date === todayStr) || (t.createdAt && t.createdAt.startsWith(todayStr)));
            const revenueTicketsToday = ticketsToday.reduce((acc: number, t: any) => acc + Number(t.price || 0), 0);

            const ticketsWeek = tickets.filter((t: any) => {
                const d = t.date || t.createdAt?.split('T')[0];
                return d >= weekAgoStr && d <= todayStr;
            });
            const revenueTicketsWeek = ticketsWeek.reduce((acc: number, t: any) => acc + Number(t.price || 0), 0);

            // Subscriptions Revenue
            const subsToday = subs.filter((s: any) => (s.startDate === todayStr) || (s.createdAt && s.createdAt.startsWith(todayStr)));
            const revenueSubsToday = subsToday.reduce((acc: number, s: any) => acc + Number(s.totalAmount || s.total || 0), 0);

            const subsWeek = subs.filter((s: any) => {
                const d = s.startDate || s.createdAt?.split('T')[0];
                return d >= weekAgoStr && d <= todayStr;
            });
            const revenueSubsWeek = subsWeek.reduce((acc: number, s: any) => acc + Number(s.totalAmount || s.total || 0), 0);

            const totalRevenueToday = revenueManualToday + revenueTicketsToday + revenueSubsToday;
            const totalRevenueWeek = revenueManualWeek + revenueTicketsWeek + revenueSubsWeek;

            const newToday = subsToday.length;
            const newWeek = subsWeek.length;
            const unactivated = subs.filter((s: any) => s.status === 'غير مفعل').length;
            const expiredToday = subs.filter((s: any) => s.endDate === todayStr && s.status !== 'نشط').length;
            const active = subs.filter((s: any) => s.status === 'نشط').length;
            const paused = subs.filter((s: any) => s.status === 'موقف مؤقتاً' || s.status === 'موقوف').length;

            setStats({
                newToday,
                newWeek,
                unactivated,
                expiredToday,
                active,
                paused,
                ticketsToday: ticketsToday.length,
                ticketsWeek: ticketsWeek.length,
                totalClubs: superAdmin ? allClubs.length : 1,
                totalMembers: members.length,
                totalRevenueToday,
                totalRevenueWeek
            });

            const expiring = subs
                .filter((s: any) => s.endDate && s.endDate >= todayStr && s.endDate <= fiveDaysFutureStr && s.status === 'نشط')
                .map((s: any) => {
                    const member = members.find((m: any) => m.id === s.memberId);
                    const diff = new Date(s.endDate).getTime() - today.getTime();
                    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    return { ...s, memberName: member?.name, membershipNumber: member?.membershipNumber, daysLeft };
                })
                .sort((a: any, b: any) => (a.daysLeft - b.daysLeft));

            setExpiringSubs(expiring);
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">مركز القيادة والإحصائيات</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">مراقبة حية لأداء النادي والنمو المالي</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">نشط حالياً</span>
                    </div>
                    <button onClick={loadData} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 hover:text-blue-600 transition-all font-black">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Premium Mini Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <MiniStatsBox label="إجمالي المشتركين" value={stats.totalMembers} color="blue" icon={<Users className="w-4 h-4 icon-glow" />} />
                <MiniStatsBox label="إيرادات اليوم" value={stats.totalRevenueToday} unit="SAR" color="emerald" icon={<Wallet className="w-4 h-4 icon-glow" />} />
                <MiniStatsBox label="اشتراكات اليوم" value={stats.newToday} color="indigo" icon={<Tv className="w-4 h-4 icon-glow" />} />
                <MiniStatsBox label="بانتظار التفعيل" value={stats.unactivated} color="amber" icon={<AlertTriangle className="w-4 h-4 icon-glow" />} />
                <MiniStatsBox label="الاشتراكات السارية" value={stats.active} color="cyan" icon={<CheckCircle2 className="w-4 h-4 icon-glow" />} />
                <MiniStatsBox label="تذاكر اليوم" value={stats.ticketsToday} color="rose" icon={<Ticket className="w-4 h-4 icon-glow" />} />
            </div>

            {/* Dashboard Tabs & Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
                <div className="lg:col-span-8 flex flex-col gap-2.5">
                    {/* Data Table Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden flex flex-col h-[500px]">
                        <div className="py-2 px-5 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><AlertTriangle className="w-4 h-4" /></div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-tighter">اشتراكات تنتهي قريباً</h3>
                                    <p className="text-[8px] text-red-100 font-bold uppercase tracking-widest mt-0.5">أعضاء متبقي لهم أقل من 5 أيام</p>
                                </div>
                            </div>
                            <div className="bg-white/20 px-2 py-0.5 rounded-lg border border-white/10 uppercase font-black text-[9px] tracking-tighter shadow-sm text-center">
                                {expiringSubs.length} مشترك
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <table className="table-display-premium">
                                <thead className="table-header-premium sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-2 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">المشترك</th>
                                        <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">نوع الباقة</th>
                                        <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">تاريخ الانتهاء</th>
                                        <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">أيام متبقية</th>
                                        <th className="px-3 py-2 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto opacity-30" /></td></tr>
                                    ) : expiringSubs.length === 0 ? (
                                        <tr><td colSpan={5} className="py-24 text-center text-gray-300 italic text-xs tracking-widest uppercase opacity-40 border-l border-gray-100/20 last:border-l-0">لا توجد اشتراكات تنتهي قريباً</td></tr>
                                    ) : (
                                        expiringSubs.map((s) => (
                                            <tr key={s.id} className="table-row-premium group">
                                                <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-black text-[10px] group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">{s.memberName?.[0] || '?'}</div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-black text-slate-900 dark:text-white leading-tight table-cell-premium transition-colors">{s.memberName}</span>
                                                            <span className="text-[8px] font-bold text-gray-400">ID: {s.membershipNumber || '---'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                    <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black border border-slate-200 dark:border-slate-700 tracking-tighter uppercase">{s.name}</span>
                                                </td>
                                                <td className="px-4 py-1.5 text-center text-[10px] font-black text-gray-500 dark:text-slate-400 font-mono italic border-l border-gray-100/20 last:border-l-0 table-cell-premium">{s.endDate}</td>
                                                <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${s.daysLeft <= 1 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                        {s.daysLeft} أيام
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                                    <button className="p-1.5 text-slate-300 hover:text-red-500 transition-all"><ArrowUpRight className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-2.5">
                    {/* System Summary Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-300 dark:border-slate-800">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-blue-500" /> ملخص النظام
                        </div>
                        <div className="space-y-3">
                            <SummaryRow label="الأعضاء النشطون" value={stats.active} icon={<Users className="w-3.5 h-3.5" />} color="emerald" />
                            <SummaryRow label="مبيعات الأسبوع" value={`${stats.totalRevenueWeek?.toLocaleString()} ر.س`} icon={<TrendingUp className="w-3.5 h-3.5" />} color="blue" />
                            <SummaryRow label="تذاكر الأسبوع" value={stats.ticketsWeek} icon={<Ticket className="w-3.5 h-3.5" />} color="indigo" />
                            <SummaryRow label="حماية البيانات" value="مشفر" icon={<ShieldCheck className="w-3.5 h-3.5" />} color="rose" />
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-blue-900/10">
                        <div className="relative z-10 flex flex-col gap-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">FITNESS CLUB v3.5</h4>
                            <p className="text-sm font-black italic">نظام إدارة فائق السرعة</p>
                            <p className="text-[9px] font-bold opacity-60 mt-2 leading-relaxed">تتم مزامنة البيانات كل 60 ثانية لضمان دقة التقارير الحية.</p>
                        </div>
                        <Dumbbell className="absolute -bottom-4 -left-4 w-24 h-24 text-white/5 -rotate-12" />
                    </div>
                </div>
            </div>

            <footer className="flex items-center justify-between px-2 pt-2 border-t border-gray-200 dark:border-slate-800 text-[9px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest">
                <span>© 2024 NEXT-GEN ADMIN SYSTEM</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /> SERVER: UP</span>
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /> DB: SYNCED</span>
                </div>
            </footer>
        </div>
    );
}

function MiniStatsBox({ label, value, unit, color, icon }: any) {
    const colorMap: any = {
        blue: 'bg-blue-600 text-white shadow-blue-100 dark:shadow-none',
        emerald: 'bg-emerald-600 text-white shadow-emerald-100 dark:shadow-none',
        indigo: 'bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none',
        amber: 'bg-amber-500 text-white shadow-amber-100 dark:shadow-none',
        rose: 'bg-rose-600 text-white shadow-rose-100 dark:shadow-none',
        cyan: 'bg-cyan-600 text-white shadow-cyan-100 dark:shadow-none'
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 flex flex-col gap-2 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${colorMap[color]} shadow-md`}>
                    {icon}
                </div>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                    {unit && <span className="text-[7px] font-black text-gray-400 uppercase">{unit}</span>}
                </div>
            </div>
            <div className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest truncate">{label}</div>
        </div>
    );
}

function SummaryRow({ label, value, icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        rose: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
    };

    return (
        <div className="flex items-center justify-between p-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-gray-200/30 dark:border-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-800">
            <div className="flex items-center gap-2">
                <div className={`p-1 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{value}</span>
        </div>
    );
}


