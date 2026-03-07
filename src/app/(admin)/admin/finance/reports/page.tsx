"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    PieChart,
    Search,
    Calendar,
    Wallet,
    TrendingUp,
    TrendingDown,
    Printer,
    Download,
    Filter,
    LayoutGrid,
    FileText,
    BarChart3,
    ArrowRightCircle,
    RotateCcw,
    Loader2,
    CheckCircle2,
    DollarSign,
    CreditCard,
    Receipt,
    Banknote,
    ArrowUpDown,
    Users,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Building,
    FileSpreadsheet,
    FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import * as XLSX from 'xlsx';

const reportTypes = [
    // --- إيرادات ومصروفات ---
    { id: 'treasury-movement', title: 'تقرير بحركة الخزينة خلال فترة محددة', icon: <Wallet className="w-5 h-5 text-blue-500" />, type: 'range', category: 'إيرادات ومصروفات' },
    { id: 'revenue-period', title: 'تقرير بإيرادات الخزينة خلال فترة محددة', icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, type: 'range', category: 'إيرادات ومصروفات' },
    { id: 'revenue-type-period', title: 'تقرير إيرادات محدد خلال فترة محددة', icon: <Receipt className="w-5 h-5 text-teal-500" />, type: 'type-range', category: 'إيرادات ومصروفات' },
    { id: 'expense-period', title: 'تقرير بمصروفات الخزينة خلال فترة محددة', icon: <TrendingDown className="w-5 h-5 text-rose-500" />, type: 'range', category: 'إيرادات ومصروفات' },
    { id: 'expense-type-period', title: 'تقرير مصروفات محدد خلال فترة محددة', icon: <CreditCard className="w-5 h-5 text-orange-500" />, type: 'expense-type-range', category: 'إيرادات ومصروفات' },
    { id: 'revenue-vs-expense', title: 'تقرير مقارنة الإيرادات والمصروفات خلال فترة', icon: <ArrowUpDown className="w-5 h-5 text-indigo-500" />, type: 'range', category: 'إيرادات ومصروفات' },
    { id: 'daily-treasury', title: 'تقرير بحركة الخزينة ليوم محدد', icon: <Banknote className="w-5 h-5 text-amber-500" />, type: 'date', category: 'إيرادات ومصروفات' },
    // --- الاشتراكات المالية ---
    { id: 'subscription-revenue-period', title: 'تقرير بإيرادات الاشتراكات خلال فترة محددة', icon: <ClipboardList className="w-5 h-5 text-violet-500" />, type: 'range', category: 'الاشتراكات المالية' },
    { id: 'payment-method-period', title: 'تقرير بطرق الدفع خلال فترة محددة', icon: <DollarSign className="w-5 h-5 text-cyan-500" />, type: 'range', category: 'الاشتراكات المالية' },
];

export default function FinanceReportsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Filters
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRevenueType, setSelectedRevenueType] = useState('');
    const [selectedExpenseType, setSelectedExpenseType] = useState('');

    // Data for selectors
    const [revenueTypes, setRevenueTypes] = useState<any[]>([]);
    const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
    const [clubProfile, setClubProfile] = useState<any>(null);

    // Results
    const [results, setResults] = useState<any[] | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) { router.push('/auth/login'); return; }
        setUser(currentUser);
        loadMetadata();
    }, [router]);

    async function loadMetadata() {
        setLoading(true);
        try {
            const clubId = auth.getCurrentUser()?.clubId || (auth.getCurrentUser() as any)?.club_id;
            const [revTypes, expTypes, allProfiles] = await Promise.all([
                db.getAll('revenueTypes'),
                db.getAll('expenseTypes'),
                db.getAll('club_profiles')
            ]);
            setRevenueTypes(revTypes || []);
            setExpenseTypes(expTypes || []);

            const myProfile = allProfiles?.find((p: any) => p.clubId === clubId);
            setClubProfile(myProfile || null);
        } catch (e) {
            console.error('Error loading metadata:', e);
        } finally {
            setLoading(false);
        }
    }

    const generateReport = async () => {
        if (!selectedReport) return;
        setIsGenerating(true);
        setResults(null);
        setSummary(null);
        setCurrentPage(1);

        try {
            let data: any[] = [];
            let summaryData: any = null;

            const allRevenues = await db.getAll('revenueEntries');
            const allExpenses = await db.getAll('expenseEntries');
            const allRevenueTypes = await db.getAll('revenueTypes');
            const allExpenseTypes = await db.getAll('expenseTypes');
            const allClubs = await db.getAll('clubs');

            const mapRevenue = (r: any) => {
                const type = allRevenueTypes.find((t: any) => t.id === r.typeId);
                const club = allClubs.find((c: any) => c.id === r.clubId);
                return { ...r, typeName: type?.name || '---', clubName: club?.name || '---', entryType: 'إيراد' };
            };

            const mapExpense = (e: any) => {
                const type = allExpenseTypes.find((t: any) => t.id === e.typeId);
                const club = allClubs.find((c: any) => c.id === e.clubId);
                return { ...e, typeName: type?.name || '---', clubName: club?.name || '---', entryType: 'مصروف' };
            };

            const inRange = (d: string) => d >= startDate && d <= endDate;
            const isDay = (d: string) => d === date;

            switch (selectedReport) {
                case 'treasury-movement': {
                    const revInRange = allRevenues.filter((r: any) => inRange(r.date)).map(mapRevenue);
                    const expInRange = allExpenses.filter((e: any) => inRange(e.date)).map(mapExpense);
                    data = [...revInRange, ...expInRange].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const totalRev = revInRange.reduce((s: number, r: any) => s + Number(r.amount), 0);
                    const totalExp = expInRange.reduce((s: number, e: any) => s + Number(e.amount), 0);
                    summaryData = { totalRevenue: totalRev, totalExpense: totalExp, net: totalRev - totalExp };
                    break;
                }
                case 'revenue-period': {
                    data = allRevenues.filter((r: any) => inRange(r.date)).map(mapRevenue)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const total = data.reduce((s, r) => s + Number(r.amount), 0);
                    summaryData = { totalRevenue: total, count: data.length };
                    break;
                }
                case 'revenue-type-period': {
                    data = allRevenues.filter((r: any) => inRange(r.date) && (!selectedRevenueType || r.typeId === selectedRevenueType)).map(mapRevenue)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const total = data.reduce((s, r) => s + Number(r.amount), 0);
                    summaryData = { totalRevenue: total, count: data.length };
                    break;
                }
                case 'expense-period': {
                    data = allExpenses.filter((e: any) => inRange(e.date)).map(mapExpense)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const total = data.reduce((s, e) => s + Number(e.amount), 0);
                    summaryData = { totalExpense: total, count: data.length };
                    break;
                }
                case 'expense-type-period': {
                    data = allExpenses.filter((e: any) => inRange(e.date) && (!selectedExpenseType || e.typeId === selectedExpenseType)).map(mapExpense)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const total = data.reduce((s, e) => s + Number(e.amount), 0);
                    summaryData = { totalExpense: total, count: data.length };
                    break;
                }
                case 'revenue-vs-expense': {
                    const revInRange = allRevenues.filter((r: any) => inRange(r.date)).map(mapRevenue);
                    const expInRange = allExpenses.filter((e: any) => inRange(e.date)).map(mapExpense);
                    data = [...revInRange, ...expInRange].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const totalRev = revInRange.reduce((s: number, r: any) => s + Number(r.amount), 0);
                    const totalExp = expInRange.reduce((s: number, e: any) => s + Number(e.amount), 0);
                    summaryData = { totalRevenue: totalRev, totalExpense: totalExp, net: totalRev - totalExp, revenueCount: revInRange.length, expenseCount: expInRange.length };
                    break;
                }
                case 'daily-treasury': {
                    const revDay = allRevenues.filter((r: any) => isDay(r.date)).map(mapRevenue);
                    const expDay = allExpenses.filter((e: any) => isDay(e.date)).map(mapExpense);
                    data = [...revDay, ...expDay].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
                    const totalRev = revDay.reduce((s: number, r: any) => s + Number(r.amount), 0);
                    const totalExp = expDay.reduce((s: number, e: any) => s + Number(e.amount), 0);
                    summaryData = { totalRevenue: totalRev, totalExpense: totalExp, net: totalRev - totalExp };
                    break;
                }
                case 'subscription-revenue-period': {
                    const allSubs = await db.getAll('subscriptions');
                    const allMembers = await db.getAll('members');
                    data = allSubs.filter((s: any) => {
                        const subDate = s.startDate || s.createdAt?.split('T')[0];
                        return subDate && subDate >= startDate && subDate <= endDate;
                    }).map((s: any) => {
                        const member = allMembers.find((m: any) => m.id === s.memberId);
                        return {
                            ...s,
                            memberName: member?.name || '---',
                            memberPhone: member?.phone || '---',
                            entryType: 'اشتراك',
                            date: s.startDate || s.createdAt?.split('T')[0],
                            amount: Number(s.paid || s.price || 0)
                        };
                    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    const total = data.reduce((s, r) => s + Number(r.amount), 0);
                    summaryData = { totalRevenue: total, count: data.length };
                    break;
                }
                case 'payment-method-period': {
                    const revInRange = allRevenues.filter((r: any) => inRange(r.date)).map(mapRevenue);
                    const methods: Record<string, { count: number, total: number }> = {};
                    revInRange.forEach((r: any) => {
                        const method = r.paymentMethod || 'نقدي';
                        if (!methods[method]) methods[method] = { count: 0, total: 0 };
                        methods[method].count++;
                        methods[method].total += Number(r.amount);
                    });
                    data = Object.entries(methods).map(([method, info]) => ({
                        paymentMethod: method,
                        count: info.count,
                        amount: info.total,
                        entryType: 'ملخص'
                    }));
                    const totalAll = revInRange.reduce((s: number, r: any) => s + Number(r.amount), 0);
                    summaryData = { totalRevenue: totalAll, count: revInRange.length, methodsCount: data.length };
                    break;
                }
                default:
                    data = [];
            }

            setResults(data);
            setSummary(summaryData);
        } catch (e) {
            console.error('Error generating report:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const exportToExcel = () => {
        if (!results || results.length === 0) return;

        const headers = getTableHeaders();
        const data = results.map(item => {
            if (selectedReport === 'payment-method-period') {
                return {
                    [headers[0]]: item.paymentMethod,
                    [headers[1]]: item.count,
                    [headers[2]]: item.amount
                };
            }
            if (selectedReport === 'subscription-revenue-period') {
                return {
                    [headers[0]]: item.date,
                    [headers[1]]: item.memberName,
                    [headers[2]]: item.memberPhone,
                    [headers[3]]: item.status,
                    [headers[4]]: item.amount
                };
            }
            return {
                [headers[0]]: item.date,
                [headers[1]]: item.entryType,
                [headers[2]]: item.typeName,
                [headers[3]]: item.note || '',
                [headers[4]]: item.paymentMethod || 'نقدي',
                [headers[5]]: item.amount
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${currentReport?.title || 'report'}.xlsx`);
    };

    const exportToPDF = () => {
        window.print();
    };

    const currentReport = reportTypes.find(r => r.id === selectedReport);

    // Group reports by category
    const groupedReports = useMemo(() => {
        const groups: Record<string, typeof reportTypes> = {};
        reportTypes.forEach(r => {
            if (!groups[r.category]) groups[r.category] = [];
            groups[r.category].push(r);
        });
        return groups;
    }, []);

    // Pagination
    const paginatedResults = useMemo(() => {
        if (!results) return [];
        const start = (currentPage - 1) * pageSize;
        return results.slice(start, start + pageSize);
    }, [results, currentPage]);

    const totalPages = results ? Math.ceil(results.length / pageSize) : 0;

    const formatCurrency = (val: number) => {
        return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    // Determine table columns based on report type
    const getTableHeaders = () => {
        if (!selectedReport) return [];
        if (selectedReport === 'payment-method-period') {
            return ['طريقة الدفع', 'عدد العمليات', 'إجمالي المبلغ'];
        }
        if (selectedReport === 'subscription-revenue-period') {
            return ['التاريخ', 'اسم العميل', 'الهاتف', 'الحالة', 'المبلغ المدفوع'];
        }
        return ['التاريخ', 'النوع', 'التصنيف', 'البيان', 'طريقة الدفع', 'المبلغ'];
    };

    const paymentBreakdown = React.useMemo(() => {
        if (!results || results.length === 0) return null;
        if (selectedReport === 'payment-method-period') return null; // Already aggregated

        const totals: Record<string, number> = {};
        let total = 0;
        let count = 0;

        results.forEach(item => {
            if (item.entryType === 'مصروف' || item.type === 'expense') return; // Only breakdown income by default
            const amount = Number(item.amount) || 0;
            const pm = item.paymentMethod || item.payment_method || 'نقدي';
            totals[pm] = (totals[pm] || 0) + amount;
            total += amount;
            count++;
        });

        if (count === 0) return null;
        return { totals, total };
    }, [results, selectedReport]);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            <div className="flex flex-col gap-2.5 print:hidden">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">تقارير الحسابات والخزينة</h1>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">استخراج التقارير المالية والتحليلية للخزينة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 px-3 rounded-xl border border-gray-300 dark:border-slate-700">
                        <div className="text-left px-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">النادي الحالي</p>
                            <p className="text-[11px] font-black text-blue-600 dark:text-blue-400">{(user as any)?.clubName || 'جاري التحميل...'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 border border-gray-300 dark:border-slate-600 shadow-sm">
                            <Building className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                    {/* Reports Menu */}
                    <div className="xl:col-span-4 space-y-3">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 px-6 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                                    مكتبة التقارير
                                </h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {Object.entries(groupedReports).map(([category, reports]) => (
                                    <div key={category} className="mb-4 last:mb-2">
                                        <div className="px-4 py-2 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-blue-600/30 rounded-full" />
                                            <span className="text-[9px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-widest">{category}</span>
                                        </div>
                                        <div className="space-y-1 mt-1">
                                            {reports.map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => {
                                                        setSelectedReport(report.id);
                                                        setResults(null);
                                                        setSummary(null);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-2.5 px-4 rounded-2xl transition-all duration-300 group ${selectedReport === report.id
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${selectedReport === report.id
                                                        ? 'bg-white/20'
                                                        : 'bg-white dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 shadow-sm border border-gray-300 dark:border-slate-800'
                                                        }`}>
                                                        {React.cloneElement(report.icon as React.ReactElement<any>, {
                                                            className: `w-4.5 h-4.5 ${selectedReport === report.id ? 'text-white' : ''}`
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] font-black text-right flex-1 leading-tight tracking-tight">{report.title}</span>
                                                    <ChevronLeft className={`w-3.5 h-3.5 transition-all duration-300 ${selectedReport === report.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Configuration & Results */}
                    <div className="xl:col-span-8 flex flex-col gap-2.5">

                        {/* Report Configuration */}
                        <AnimatePresence mode="wait">
                            {selectedReport ? (
                                <motion.div
                                    key={selectedReport}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-300 dark:border-slate-800 relative z-10"
                                >
                                    <div className="absolute top-6 left-6 opacity-5 pointer-events-none">
                                        {currentReport && React.cloneElement(currentReport.icon as React.ReactElement<any>, { className: 'w-24 h-24' })}
                                    </div>

                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest mb-2 border border-blue-100 dark:border-blue-900/30">
                                                <Calendar className="w-3 h-3" />
                                                إعدادات التقرير المالي
                                            </div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">{currentReport?.title}</h2>
                                        </div>
                                        <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(currentReport?.type === 'date') && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">التاريخ المحدد</label>
                                                <DatePicker
                                                    value={date}
                                                    onChange={(d) => setDate(d)}
                                                    className="w-full h-12"
                                                />
                                            </div>
                                        )}

                                        {(currentReport?.type === 'range' || currentReport?.type === 'type-range' || currentReport?.type === 'expense-type-range') && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">من تاريخ</label>
                                                    <DatePicker
                                                        value={startDate}
                                                        onChange={(d) => setStartDate(d)}
                                                        className="w-full h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">إلى تاريخ</label>
                                                    <DatePicker
                                                        value={endDate}
                                                        onChange={(d) => setEndDate(d)}
                                                        className="w-full h-12"
                                                    />
                                                </div>

                                                <div className="md:col-span-2 flex flex-wrap gap-2 pt-1">
                                                    {[
                                                        { label: 'اليوم', action: () => { const t = new Date().toISOString().split('T')[0]; setStartDate(t); setEndDate(t); } },
                                                        { label: 'أمس', action: () => { const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; setStartDate(yesterday); setEndDate(yesterday); } },
                                                        { label: 'آخر 7 أيام', action: () => { const week = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]; setStartDate(week); setEndDate(new Date().toISOString().split('T')[0]); } },
                                                        { label: 'هذا الشهر', action: () => { const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]; setStartDate(monthStart); setEndDate(new Date().toISOString().split('T')[0]); } },
                                                    ].map((p, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={p.action}
                                                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-[9px] font-black border border-gray-300 dark:border-slate-700 transition-all active:scale-95"
                                                        >
                                                            {p.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {currentReport?.type === 'type-range' && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">تصنيف الإيراد</label>
                                                <select
                                                    value={selectedRevenueType}
                                                    onChange={e => setSelectedRevenueType(e.target.value)}
                                                    className="w-full h-12 px-5 bg-slate-50/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-800 rounded-2xl text-[11px] font-black dark:text-white outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                                                >
                                                    <option value="">-- جميع التصنيفات --</option>
                                                    {revenueTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {currentReport?.type === 'expense-type-range' && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">تصنيف المصروف</label>
                                                <select
                                                    value={selectedExpenseType}
                                                    onChange={e => setSelectedExpenseType(e.target.value)}
                                                    className="w-full h-12 px-5 bg-slate-50/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-800 rounded-2xl text-[11px] font-black dark:text-white outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                                                >
                                                    <option value="">-- جميع التصنيفات --</option>
                                                    {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={generateReport}
                                            disabled={isGenerating}
                                            className="flex-1 h-12 bg-gradient-to-l from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                                            توليد التقرير المالي الآن
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl shadow-sm transition-all border border-amber-100 dark:border-amber-900/30 group/btn active:scale-90">
                                            <Printer className="w-4 h-4 icon-glow" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-200 dark:border-slate-700 relative">
                                        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl" />
                                        <FileText className="w-10 h-10 text-slate-300 relative" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">مرحباً بك في وحدة التقارير</h3>
                                    <p className="text-[11px] font-bold text-slate-400 max-w-xs mt-3 leading-relaxed">يرجى اختيار أحد التقارير المالية من القائمة الجانبية للبدء في تحليل البيانات واستخراج النتائج.</p>
                                    <div className="mt-8 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Summary Cards */}
                        {summary && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                {summary.totalRevenue !== undefined && (
                                    <SummaryCard
                                        label="إجمالي الإيرادات"
                                        value={formatCurrency(summary.totalRevenue)}
                                        color="emerald"
                                        icon={<TrendingUp className="w-4.5 h-4.5 text-emerald-500" />}
                                    />
                                )}
                                {summary.totalExpense !== undefined && (
                                    <SummaryCard
                                        label="إجمالي المصروفات"
                                        value={formatCurrency(summary.totalExpense)}
                                        color="rose"
                                        icon={<TrendingDown className="w-4.5 h-4.5 text-rose-500" />}
                                    />
                                )}
                                {summary.net !== undefined && (
                                    <SummaryCard
                                        label="صافي الحركة"
                                        value={formatCurrency(summary.net)}
                                        color={summary.net >= 0 ? 'blue' : 'amber'}
                                        icon={<ArrowUpDown className="w-4.5 h-4.5 text-blue-500" />}
                                    />
                                )}
                                {summary.count !== undefined && (
                                    <SummaryCard
                                        label="عدد السجلات"
                                        value={summary.count.toString()}
                                        color="slate"
                                        icon={<FileText className="w-4.5 h-4.5 text-slate-500" />}
                                        unit="سجل"
                                    />
                                )}
                            </motion.div>
                        )}

                        {/* Report Results */}
                        {results !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden mt-2"
                            >
                                <div className="p-4 px-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
                                            <CheckCircle2 className="w-4 h-4 icon-glow" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">النتائج المالية المستخرجة</h3>
                                            <p className="text-[9px] font-bold text-slate-400">تم استخراج {results.length} سجل بنجاح</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 no-print">
                                        <button
                                            onClick={exportToPDF}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black transition-all shadow-lg shadow-rose-500/10 active:scale-95"
                                        >
                                            <FileDown className="w-4 h-4 icon-glow" /> استخراج PDF
                                        </button>
                                        <button
                                            onClick={exportToExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 icon-glow" /> استخراج Excel
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-right border-separate border-spacing-0">
                                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[9px] font-black uppercase tracking-[0.2em]">
                                            <tr>
                                                {getTableHeaders().map((header, idx) => (
                                                    <th key={idx} className="px-4 py-3 text-center first:pr-6 last:pl-6 border-l border-white/5 last:border-l-0">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/40">
                                            {paginatedResults.length > 0 ? paginatedResults.map((item, idx) => {
                                                if (selectedReport === 'payment-method-period') {
                                                    return (
                                                        <tr key={idx} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all cursor-pointer">
                                                            <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black border border-blue-100 dark:border-blue-900/30">
                                                                    <CreditCard className="w-3 h-3 icon-glow" />
                                                                    {item.paymentMethod}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-1 text-center text-[10px] font-black text-slate-600 dark:text-slate-400 border-l border-gray-100/20 last:border-l-0">{item.count}</td>
                                                            <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                                                                    {formatCurrency(item.amount)} <small className="text-[9px] opacity-40 ml-1">SAR</small>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                if (selectedReport === 'subscription-revenue-period') {
                                                    return (
                                                        <tr key={idx} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all cursor-pointer">
                                                            <td className="px-4 py-1 text-center text-[9px] font-black text-gray-400 font-mono tracking-tighter border-l border-gray-100/20 last:border-l-0">{item.date}</td>
                                                            <td className="px-4 py-1 text-center text-[10px] font-black text-slate-700 dark:text-slate-300 border-l border-gray-100/20 last:border-l-0">{item.memberName}</td>
                                                            <td className="px-4 py-1 text-center text-[9px] font-bold text-slate-400 font-mono border-l border-gray-100/20 last:border-l-0" dir="ltr">{item.memberPhone}</td>
                                                            <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black border ${item.status === 'نشط'
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/10'
                                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-300'
                                                                    }`}>
                                                                    <div className={`w-1 h-1 rounded-full ${item.status === 'نشط' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                                    {item.status || '---'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                                                                    {formatCurrency(item.amount)} <small className="text-[9px] opacity-40 ml-1">SAR</small>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                // Default: treasury/revenue/expense rows
                                                return (
                                                    <tr key={idx} className="hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all group cursor-pointer">
                                                        <td className="px-4 py-1 text-center text-[9px] font-black text-gray-400 font-mono tracking-tighter border-l border-gray-100/20 last:border-l-0">{item.date}</td>
                                                        <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black border ${item.entryType === 'إيراد'
                                                                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20'
                                                                : 'bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/20'
                                                                }`}>
                                                                {item.entryType === 'إيراد' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                                                {item.entryType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-1 text-center text-[9px] font-black text-slate-500 dark:text-slate-400 border-l border-gray-100/20 last:border-l-0">{item.typeName}</td>
                                                        <td className="px-4 py-1 border-l border-gray-100/20 last:border-l-0">
                                                            <p className="text-[9px] font-bold text-gray-600 dark:text-slate-400 truncate max-w-[180px] pr-2">{item.note || '---'}</p>
                                                        </td>
                                                        <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                            <span className="text-[8px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-300 dark:border-slate-700">{item.paymentMethod || 'نقدي'}</span>
                                                        </td>
                                                        <td className="px-4 py-1 text-center border-l border-gray-100/20 last:border-l-0">
                                                            <span className={`text-xs font-black ${item.entryType === 'إيراد' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} dir="ltr">
                                                                {item.entryType === 'مصروف' ? '-' : '+'}{formatCurrency(item.amount)}
                                                                <small className="text-[9px] opacity-40 ml-1">SAR</small>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={getTableHeaders().length} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                                        <div className="flex flex-col items-center opacity-30 grayscale pointer-events-none">
                                                            <Search className="w-16 h-16 mb-4 text-slate-300" />
                                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">لا توجد بيانات متاحة لهذا التقرير</p>
                                                            <p className="text-[9px] font-bold text-slate-400 mt-2">جرب تغيير معايير البحث أو الفترة الزمنية</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {results.length > 0 && (
                                    <div className="p-4 px-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm border border-gray-300 dark:border-slate-800">
                                                السجلات: <span className="text-blue-600 ml-1">{results.length}</span>
                                            </p>
                                            {totalPages > 1 && (
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    الصفحات: <span className="text-slate-600 dark:text-slate-300 ml-1">{currentPage} / {totalPages}</span>
                                                </p>
                                            )}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all active:scale-95"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum: number;
                                                        if (totalPages <= 5) pageNum = i + 1;
                                                        else if (currentPage <= 3) pageNum = i + 1;
                                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                                        else pageNum = currentPage - 2 + i;

                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all duration-300 ${currentPage === pageNum
                                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110'
                                                                    : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:border-blue-500/30'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all active:scale-95"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Printable Report Layout */}
            <div className="hidden print:block bg-white text-black rtl w-full" dir="rtl">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4">
                    <div className="flex-1 text-right">
                        <h1 className="text-xl font-black mb-1">{clubProfile?.nameAr || clubProfile?.name_ar || (user as any)?.clubName || 'تقرير النادي'}</h1>
                        <p className="text-[11px] font-bold text-slate-500 mb-0.5">تقرير: {currentReport?.title}</p>
                        <p className="text-[10px] font-bold text-slate-400">الاستخراج: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}</p>
                        {startDate !== endDate ? (
                            <p className="text-[10px] font-bold mt-1">الفترة: من {startDate} إلى {endDate}</p>
                        ) : (
                            <p className="text-[10px] font-bold mt-1">التاريخ: {date || startDate}</p>
                        )}
                    </div>
                    {clubProfile?.logoUrl || clubProfile?.logo_url ? (
                        <img src={clubProfile.logoUrl || clubProfile.logo_url} className="w-16 h-16 object-contain" alt="Logo" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-black text-xl rounded-xl">FC</div>
                    )}
                </div>

                {summary && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {summary.totalRevenue !== undefined && (
                            <div className="p-2 border border-slate-200 rounded-lg">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي الإيرادات</p>
                                <p className="text-sm font-black">{formatCurrency(summary.totalRevenue)} SAR</p>
                            </div>
                        )}
                        {summary.totalExpense !== undefined && (
                            <div className="p-2 border border-slate-200 rounded-lg">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي المصروفات</p>
                                <p className="text-sm font-black">{formatCurrency(summary.totalExpense)} SAR</p>
                            </div>
                        )}
                        {summary.net !== undefined && (
                            <div className="p-2 border border-slate-200 rounded-lg">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">صافي الحركة</p>
                                <p className="text-sm font-black">{formatCurrency(summary.net)} SAR</p>
                            </div>
                        )}
                        <div className="p-2 border border-slate-200 rounded-lg">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">عدد السجلات</p>
                            <p className="text-sm font-black">{results?.length || 0}</p>
                        </div>
                    </div>
                )}

                <table className="w-full text-right border-collapse border border-slate-300 mb-6">
                    <thead className="bg-slate-100">
                        <tr>
                            {getTableHeaders().map((header, idx) => (
                                <th key={idx} className="px-2 py-1 border border-slate-300 text-[10px] font-black">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {results?.map((item, idx) => (
                            <tr key={idx}>
                                {selectedReport === 'payment-method-period' ? (
                                    <>
                                        <td className="px-2 py-1 border border-slate-300 text-[10px] font-bold">{item.paymentMethod}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[10px] font-bold text-center">{item.count}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center" dir="ltr">{formatCurrency(item.amount)} SAR</td>
                                    </>
                                ) : selectedReport === 'subscription-revenue-period' ? (
                                    <>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.date}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold">{item.memberName}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.memberPhone}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.status}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-black text-center" dir="ltr">{formatCurrency(item.amount)} SAR</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.date}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.entryType}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.typeName}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold leading-relaxed">{item.note || '---'}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.paymentMethod || 'نقدي'}</td>
                                        <td className="px-2 py-1 border border-slate-300 text-[9px] font-black text-center" dir="ltr">
                                            {item.entryType === 'مصروف' ? '-' : '+'}{formatCurrency(item.amount)} SAR
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {paymentBreakdown && (
                    <div className="mt-6 flex justify-end page-break-inside-avoid">
                        <div className="flex flex-col border border-slate-300 rounded-xl overflow-hidden shadow-sm w-72">
                            <div className="bg-slate-100 border-b border-slate-300 p-2 px-3 flex justify-between items-center">
                                <h4 className="text-[11px] font-black text-slate-800">تفاصيل التحصيلات (الإيرادات)</h4>
                            </div>
                            <div className="flex flex-col divide-y divide-slate-200">
                                {Object.entries(paymentBreakdown.totals).map(([method, amount]) => (
                                    <div key={method} className="flex justify-between items-center p-2 px-3">
                                        <span className="text-[10px] font-bold text-slate-600">{method}</span>
                                        <span className="text-[10px] font-black" dir="ltr">{formatCurrency(amount as number)} SAR</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-emerald-50 border-t border-slate-300 p-3 flex justify-between items-center">
                                <span className="text-[11px] font-black text-emerald-800">إجمالي التحصيلات</span>
                                <span className="text-[13px] font-black text-emerald-600" dir="ltr">{formatCurrency(paymentBreakdown.total)} SAR</span>
                            </div>
                        </div>
                    </div>
                )}

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
        </div>
    );
}

function SummaryCard({ label, value, color, icon, unit = 'SAR' }: any) {
    const colorClasses: any = {
        emerald: 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/20 hover:shadow-emerald-500/5',
        rose: 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100/50 dark:border-rose-500/20 hover:shadow-rose-500/5',
        blue: 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100/50 dark:border-blue-500/20 hover:shadow-blue-500/5',
        amber: 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/20 hover:shadow-amber-500/5',
        slate: 'bg-slate-50/50 dark:bg-slate-500/5 border-slate-200/50 dark:border-slate-500/20 hover:shadow-slate-500/5',
    };

    const textColors: any = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        rose: 'text-rose-600 dark:text-rose-400',
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        slate: 'text-slate-600 dark:text-slate-400',
    };

    return (
        <div className={`p-4 rounded-[1.5rem] border shadow-sm flex items-center justify-between transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group ${colorClasses[color]}`}>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white group-hover:tracking-tight transition-all">{value}</span>
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{unit}</span>
                </div>
            </div>
            <div className={`w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center ring-1 ring-gray-300 dark:ring-slate-800 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                {icon}
            </div>
        </div>
    );
}
