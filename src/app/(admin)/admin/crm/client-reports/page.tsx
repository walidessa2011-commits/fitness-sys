"use client";

import React, { useState, useEffect } from 'react';
import {
    FileBarChart,
    Search,
    Calendar,
    Users,
    Activity,
    UserCheck,
    Clock,
    Printer,
    Download,
    Filter,
    ChevronDown,
    LayoutGrid,
    UserPlus,
    Ticket,
    Briefcase,
    Zap,
    TrendingUp,
    FileText,
    BarChart3,
    ArrowRightCircle,
    RotateCcw,
    Loader2,
    CheckCircle2,
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
    { id: 'daily-registration', title: 'تقرير بتسجيل عضويات العملاء ليوم محدد', icon: <UserPlus className="w-5 h-5 text-blue-500" />, type: 'date' },
    { id: 'group-registration', title: 'تقرير بمجموعات تسجيل عضويات العملاء ليوم محدد', icon: <Users className="w-5 h-5 text-indigo-500" />, type: 'date' },
    { id: 'safe-registration', title: 'تقرير بمجموعات تسجيل اشتراك الخزائن العملاء ليوم محدد', icon: <Briefcase className="w-5 h-5 text-emerald-500" />, type: 'date' },
    { id: 'daily-tickets-period', title: 'تقرير بتسجيل التذاكر اليومية خلال فترة محدده', icon: <Ticket className="w-5 h-5 text-amber-500" />, type: 'range' },
    { id: 'coach-tickets-period', title: 'تقرير بتسجيل التذاكر اليومية لمدرب محدد خلال فترة محدده', icon: <Activity className="w-5 h-5 text-rose-500" />, type: 'coach-range' },
    { id: 'coach-subscriptions-period', title: 'تقرير بتسجيل العضويات لمدرب محدد خلال فترة محدده', icon: <UserCheck className="w-5 h-5 text-purple-500" />, type: 'coach-range' },
    { id: 'sales-subscriptions-period', title: 'تقرير بتسجيل العضويات لموظف مبيعات محدد خلال فترة محدده', icon: <TrendingUp className="w-5 h-5 text-blue-500" />, type: 'employee-range' },
    { id: 'active-activity-subs', title: 'تقرير بالاشتراكات الفعالة لنشاط محدد', icon: <Activity className="w-5 h-5 text-teal-500" />, type: 'activity' },
    { id: 'active-type-subs', title: 'تقرير بالاشتراكات الفعالة لنوع إشتراك محدد', icon: <Filter className="w-5 h-5 text-orange-500" />, type: 'type' },
    { id: 'active-coach-subs', title: 'تقرير بالاشتراكات الفعالة لمدرب محدد', icon: <UserCheck className="w-5 h-5 text-violet-500" />, type: 'coach' },
    { id: 'ending-subs-day', title: 'تقرير بالاشتراكات التي تنتهي في يوم محدد', icon: <Clock className="w-5 h-5 text-rose-600" />, type: 'date' },
    { id: 'id-cards-period', title: 'تقرير بطباعة كارت التعريف للمشتركين خلال فترة محددة', icon: <Printer className="w-5 h-5 text-slate-500" />, type: 'range' },
    { id: 'client-data-period', title: 'تقرير بيانات العملاء المشتركين خلال فترة محددة', icon: <FileText className="w-5 h-5 text-blue-600" />, type: 'range' },
    { id: 'attendance-activity-period', title: 'تقرير بدخول الاعضاء للانشطة خلال فترة محددة', icon: <RotateCcw className="w-5 h-5 text-emerald-600" />, type: 'range' },
];

export default function ClientReportsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Filters
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCoach, setSelectedCoach] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Data for selectors
    const [coaches, setCoaches] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [clubProfile, setClubProfile] = useState<any>(null);

    // Results
    const [results, setResults] = useState<any[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

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
            const [emps, acts, subTypes, allProfiles] = await Promise.all([
                db.getAll('employees'),
                db.getAll('activities'),
                db.getAll('subscriptionTypes'),
                db.getAll('club_profiles')
            ]);

            setCoaches(emps.filter((e: any) => e.role === 'coach'));
            setEmployees(emps);
            setActivities(acts);
            setTypes(subTypes);
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

        try {
            let data: any[] = [];
            const allMembers = await db.getAll('members');
            const allSubs = await db.getAll('subscriptions');

            switch (selectedReport) {
                case 'daily-registration':
                    data = allMembers.filter((m: any) => m.createdAt?.startsWith(date));
                    break;
                case 'active-activity-subs':
                    data = allSubs.filter((s: any) => s.status === 'نشط' && s.activityId === selectedActivity);
                    break;
                case 'ending-subs-day':
                    data = allSubs.filter((s: any) => s.status === 'نشط' && s.endDate?.startsWith(date));
                    break;
                default:
                    data = allMembers.slice(0, 10);
            }

            setResults(data);
        } catch (e) {
            console.error('Error generating report:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const exportToExcel = () => {
        if (!results || results.length === 0) return;

        const headers = ['الاسم', 'رقم الهاتف', 'الحالة', 'تاريخ القيد', 'رقم العضوية'];
        const data = results.map(item => ({
            'الاسم': item.name,
            'رقم الهاتف': item.phone || '',
            'الحالة': item.status || 'نشط',
            'تاريخ القيد': item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '',
            'رقم العضوية': item.membershipNumber || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Client Report");
        XLSX.writeFile(workbook, `${currentReport?.title || 'client-report'}.xlsx`);
    };

    const exportToPDF = () => {
        window.print();
    };

    const groupedReports = {
        'تسجيل العضويات': reportTypes.slice(0, 3),
        'التذاكر والزيارات': reportTypes.slice(3, 5),
        'مدربي المبيعات': reportTypes.slice(5, 7),
        'الاشتراكات الفعالة': reportTypes.slice(7, 10),
        'المواعيد والبيانات': reportTypes.slice(10),
    };

    const currentReport = reportTypes.find(r => r.id === selectedReport);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            <div className="flex flex-col gap-2.5 print:hidden">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 px-6 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">تقارير العملاء والعضوية</h1>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" />
                                الذكاء التحليلي لبيانات المشتركين
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 px-4 rounded-2xl border border-gray-300 dark:border-slate-700 shadow-inner">
                        <div className="text-left px-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">ADMIN CENTER</p>
                            <p className="text-[12px] font-black text-indigo-600 dark:text-indigo-400">{(user as any)?.clubName || 'جاري التحميل...'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-500 border border-gray-300 dark:border-slate-600 shadow-sm transition-transform hover:rotate-12">
                            <Building className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                    {/* Reports Menu */}
                    <div className="xl:col-span-4 space-y-3">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 px-6 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                                    مكتبة التقارير
                                </h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {Object.entries(groupedReports).map(([category, reports]) => (
                                    <div key={category} className="mb-4 last:mb-2">
                                        <div className="px-4 py-2 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-indigo-600/30 rounded-full" />
                                            <span className="text-[9px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest">{category}</span>
                                        </div>
                                        <div className="space-y-1 mt-1">
                                            {reports.map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => {
                                                        setSelectedReport(report.id);
                                                        setResults(null);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-2.5 px-4 rounded-2xl transition-all duration-300 group ${selectedReport === report.id
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${selectedReport === report.id
                                                        ? 'bg-white/20'
                                                        : 'bg-white dark:bg-slate-900 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 shadow-sm border border-gray-300 dark:border-slate-800'
                                                        }`}>
                                                        {React.cloneElement(report.icon as React.ReactElement<any>, {
                                                            className: `w-4.5 h-4.5 ${selectedReport === report.id ? 'text-white' : ''}`
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] font-black text-right flex-1 leading-tight tracking-tight">{report.title}</span>
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-all duration-300 -rotate-90 ${selectedReport === report.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`} />
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
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-widest mb-2 border border-indigo-100 dark:border-indigo-900/30">
                                                <Filter className="w-3 h-3" />
                                                معايير استخراج التقرير
                                            </div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">{currentReport?.title}</h2>
                                        </div>
                                        <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(currentReport?.type === 'date' || currentReport?.type === 'range' || currentReport?.type.includes('range')) && (
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {currentReport.type === 'date' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">التاريخ المحدد</label>
                                                        <DatePicker
                                                            value={date}
                                                            onChange={(d) => setDate(d)}
                                                            className="w-full h-12"
                                                        />
                                                    </div>
                                                ) : (
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
                                                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-[9px] font-black border border-gray-300 dark:border-slate-700 transition-all active:scale-95"
                                                                >
                                                                    {p.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {currentReport?.type.includes('coach') && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">اختر المدرب المعتمد</label>
                                                <select value={selectedCoach} onChange={e => setSelectedCoach(e.target.value)} className="w-full h-12 px-5 bg-slate-50/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-800 rounded-2xl text-[11px] font-black dark:text-white outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20">
                                                    <option value="">-- اختر مدرباً --</option>
                                                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {currentReport?.type.includes('employee') && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">اختر مسؤول المبيعات</label>
                                                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="w-full h-12 px-5 bg-slate-50/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-800 rounded-2xl text-[11px] font-black dark:text-white outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20">
                                                    <option value="">-- اختر موظفاً --</option>
                                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {currentReport?.type === 'activity' && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">تصنيف النشاط الرياضي</label>
                                                <select value={selectedActivity} onChange={e => setSelectedActivity(e.target.value)} className="w-full h-12 px-5 bg-slate-50/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-800 rounded-2xl text-[11px] font-black dark:text-white outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20">
                                                    <option value="">-- اختر نشاطاً --</option>
                                                    {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {currentReport?.type === 'type' && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mr-1">نوع العضوية / الاشتراك</label>
                                                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full h-12 px-5 bg-slate-50/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-800 rounded-2xl text-[11px] font-black dark:text-white outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20">
                                                    <option value="">-- اختر نوعاً --</option>
                                                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={generateReport}
                                            disabled={isGenerating}
                                            className="flex-1 h-12 bg-gradient-to-l from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                                            توليد التقرير التحليلي الآن
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl shadow-sm transition-all border border-amber-100 dark:border-amber-900/30 group/btn active:scale-90">
                                            <Printer className="w-4 h-4 icon-glow" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-dashed border-slate-200 dark:border-slate-700 relative">
                                        <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl" />
                                        <FileBarChart className="w-10 h-10 text-slate-300 relative" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">مرحباً بك في وحدة تقارير العملاء</h3>
                                    <p className="text-[11px] font-bold text-slate-400 max-w-xs mt-3 leading-relaxed">يرجى اختيار أحد التقارير من القائمة الجانبية للبدء في تحليل بيانات العضوية والمشتركين.</p>
                                    <div className="mt-8 flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

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
                                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">سجلات البيانات المستخرجة</h3>
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
                                                <th className="px-6 py-4 text-center first:rounded-tr-3xl border-l border-white/5 last:border-l-0">البيانات الأساسية للمشترك</th>
                                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">رقم الهاتف</th>
                                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الحالة الحالية</th>
                                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">تاريخ القيد</th>
                                                <th className="px-6 py-4 text-center last:rounded-tl-3xl border-l border-white/5 last:border-l-0">إدارة الملف</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/40">
                                            {results.length > 0 ? results.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all group cursor-pointer">
                                                    <td className="px-6 py-2 border-l border-gray-100/20 last:border-l-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 font-black text-[11px] uppercase shrink-0 border border-gray-300 dark:border-slate-800 shadow-sm">
                                                                {item.name?.substring(0, 1)}
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">{item.name}</p>
                                                                <p className="text-[8px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                                                    <LayoutGrid className="w-2.5 h-2.5" />
                                                                    #{item.membershipNumber || '---'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-[10px] font-black text-slate-600 dark:text-slate-400 font-mono tracking-tighter border-l border-gray-100/20 last:border-l-0">
                                                        {item.phone || '----------'}
                                                    </td>
                                                    <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black border ${item.status === 'نشط'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/20'
                                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-300'
                                                            }`}>
                                                            <div className={`w-1 h-1 rounded-full ${item.status === 'نشط' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                            {item.status || 'نشط'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-[10px] font-black text-slate-400 font-mono border-l border-gray-100/20 last:border-l-0">
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '---'}
                                                    </td>
                                                    <td className="px-6 py-2 border-l border-gray-100/20 last:border-l-0">
                                                        <div className="flex items-center justify-center">
                                                            <button className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-xl transition-all duration-300 border border-gray-300 dark:border-slate-700 shadow-sm group/btn" title="فتح الملف">
                                                                <ArrowRightCircle className="w-4 h-4 group-hover/btn:-rotate-45 transition-transform" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                                        <div className="flex flex-col items-center opacity-30 grayscale pointer-events-none">
                                                            <Search className="w-16 h-16 mb-4 text-slate-300" />
                                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">لا توجد سجلات مطابقة لهذه المعايير</p>
                                                            <p className="text-[9px] font-bold text-slate-400 mt-2">يرجى التأكد من توفر البيانات في قواعد البيانات</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {results.length > 0 && (
                                    <div className="p-4 px-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm border border-gray-300 dark:border-slate-800">
                                            إجمالي التسجيلات المكتشفة: <span className="text-indigo-600 ml-1">{results.length}</span>
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-30">
                                                <ChevronDown className="w-4 h-4 rotate-90" />
                                            </button>
                                            <span className="text-[10px] font-black text-slate-400 px-3 py-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">1 / 1</span>
                                            <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-30">
                                                <ChevronDown className="w-4 h-4 -rotate-90" />
                                            </button>
                                        </div>
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

                <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded-lg w-fit">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي السجلات</p>
                    <p className="text-sm font-black">{results?.length || 0} سجل</p>
                </div>

                <table className="w-full text-right border-separate border-spacing-0 border border-slate-300">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">الاسم</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">رقم الهاتف</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">الحالة</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">تاريخ القيد</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">رقم العضوية</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results?.map((item, idx) => (
                            <tr key={idx}>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold">{item.name}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.phone || '---'}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.status || 'نشط'}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '---'}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-black text-center">#{item.membershipNumber || '---'}</td>
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
        </div>
    );
}
