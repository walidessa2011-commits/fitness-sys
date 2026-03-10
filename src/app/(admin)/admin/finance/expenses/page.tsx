"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Search,
    Download,
    PlusCircle,
    TrendingDown,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Trash2,
    Edit3,
    ListFilter,
    ArrowUpRight,
    Plus,
    Tag,
    Loader2,
    X,
    FileText,
    AlertCircle,
    Settings,
    ArrowRightLeft,
    Wallet,
    PieChart,
    Filter,
    Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import DeleteModal from '@/components/DeleteModal';

export default function ExpensesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [expenses, setExpenses] = useState<any[]>([]);
    const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [clubFilter, setClubFilter] = useState('');
    const [viewMode, setViewMode] = useState<'today' | 'specific' | 'range' | 'all'>('today'); // Default to today
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [clubs, setClubs] = useState<any[]>([]);
    const [clubProfile, setClubProfile] = useState<any>(null);

    // Modals
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [editingType, setEditingType] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteMode, setDeleteMode] = useState<'entry' | 'type'>('entry');

    // Form states
    const [entryForm, setEntryForm] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        typeId: '',
        note: '',
        paymentMethod: 'نقدي'
    });

    const [typeForm, setTypeForm] = useState({
        name: ''
    });

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadData(currentUser);
    }, [router]);

    async function loadData(currentUser: User) {
        setLoading(true);
        try {
            const [allEntries, allTypes, allClubs, allProfiles] = await Promise.all([
                db.getAll('expenseEntries'),
                db.getAll('expenseTypes'),
                db.getAll('clubs'),
                db.getAll('club_profiles')
            ]);

            setExpenseTypes(allTypes || []);
            setClubs(allClubs || []);

            const clubId = currentUser.clubId || (currentUser as any).club_id;
            const myProfile = allProfiles?.find((p: any) => p.clubId === clubId);
            setClubProfile(myProfile || null);

            const mapped = (allEntries || []).map((e: any) => {
                const type = (allTypes || []).find((t: any) => t.id === e.typeId);
                const club = (allClubs || []).find((c: any) => c.id === e.clubId);
                return {
                    ...e,
                    typeName: type?.name || 'محذوف',
                    clubName: club?.name || '---'
                };
            }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            let finalData = mapped;
            if (currentUser.role !== 'super_admin' && currentUser.clubId) {
                finalData = mapped.filter((e: any) => e.clubId === currentUser.clubId);
            }

            setExpenses(finalData);
            setFilteredExpenses(finalData);
        } catch (error) {
            console.error("Error loading expenses:", error);
            setExpenses([]);
            setFilteredExpenses([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let filtered = expenses.filter(e => {
            const matchSearch = (e.typeName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (e.note?.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchType = !typeFilter || e.typeId === typeFilter;
            const matchClub = !clubFilter || e.clubId === clubFilter;

            let matchDate = true;
            const todayStr = new Date().toISOString().split('T')[0];
            if (viewMode === 'today') {
                matchDate = e.date === todayStr;
            } else if (viewMode === 'specific') {
                matchDate = e.date === selectedDate;
            } else if (viewMode === 'range') {
                matchDate = e.date >= startDate && e.date <= endDate;
            }

            return matchSearch && matchType && matchClub && matchDate;
        });
        setFilteredExpenses(filtered);
    }, [searchQuery, typeFilter, clubFilter, viewMode, selectedDate, startDate, endDate, expenses]);

    const exportToPDF = () => {
        window.print();
    };

    const stats = {
        total: filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0),
        count: filteredExpenses.length,
        today: expenses.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((acc, e) => acc + Number(e.amount), 0)
    };

    const handleSaveEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const data = {
            ...entryForm,
            clubId: user.clubId || (user as any).club_id,
            amount: Number(entryForm.amount)
        };

        try {
            if (editingEntry) {
                await db.update('expenseEntries', editingEntry.id, data);
            } else {
                await db.add('expenseEntries', data);
            }
            setShowEntryModal(false);
            setEditingEntry(null);
            setEntryForm({ date: new Date().toISOString().split('T')[0], amount: '', typeId: '', note: '', paymentMethod: 'نقدي' });
            loadData(user);
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const handleSaveType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const data = {
            ...typeForm,
            clubId: user.clubId || (user as any).club_id
        };

        try {
            if (editingType) {
                await db.update('expenseTypes', editingType.id, data);
            } else {
                await db.add('expenseTypes', data);
            }
            setTypeForm({ name: '' });
            setEditingType(null);
            loadData(user);
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const deleteEntry = async (id: string) => {
        setDeleteId(id);
        setDeleteMode('entry');
        setIsDeleteModalOpen(true);
    };

    const deleteType = async (id: string) => {
        setDeleteId(id);
        setDeleteMode('type');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            const table = deleteMode === 'entry' ? 'expenseEntries' : 'expenseTypes';
            await db.delete(table, deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            if (user) loadData(user);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            <div className="print:hidden w-full flex flex-col gap-2.5 mb-10">

                {/* Ultra Compact Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">سجل ومراقبة المصروفات</h1>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة العمليات المالية والتدفقات النقدية الخارجة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowTypeModal(true)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 hover:text-rose-600 transition-all">
                            <Settings className="w-4 h-4 icon-glow" />
                        </button>
                        <button
                            onClick={() => { setEditingEntry(null); setEntryForm({ date: new Date().toISOString().split('T')[0], amount: '', typeId: '', note: '', paymentMethod: 'نقدي' }); setShowEntryModal(true); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <PlusCircle className="w-4 h-4 icon-glow" />
                            <span>تسجيل مصروف جديد</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filters & View Control */}
                <div className="flex flex-col gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('today')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${viewMode === 'today' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                مصاريف اليوم
                            </button>
                            <button
                                onClick={() => setViewMode('specific')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${viewMode === 'specific' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                يوم محدد
                            </button>
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${viewMode === 'all' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                الكل
                            </button>
                        </div>

                        {viewMode === 'specific' && (
                            <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                                <span className="text-[10px] font-black text-gray-400 uppercase">اختر التاريخ:</span>
                                <div className="w-40">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={(val) => setSelectedDate(val)}
                                        className="h-8 text-[11px] font-black border-none ring-1 ring-gray-200"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-[10px] font-black text-gray-400 hover:text-rose-600 transition-all font-tajawal"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>استخراج PDF</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="ابحث في سجل المصروفات، الملاحظات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-rose-500/30 transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                        {user?.role === 'super_admin' && (
                            <select
                                value={clubFilter}
                                onChange={(e) => setClubFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                            >
                                <option value="">جميع الفروع</option>
                                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                        >
                            <option value="">جميع التصنيفات</option>
                            {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>

                        <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-rose-600 transition-all invisible">
                            <Download className="w-4 h-4 icon-glow" />
                        </button>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-display-premium">
                            <thead className="table-header-premium">
                                <tr>
                                    <th className="px-5 py-2.5 text-center first:rounded-tr-2xl border-l border-white/5 last:border-l-0">التاريخ</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">نوع المصروف</th>
                                    <th className="px-5 py-2.5 text-right border-l border-white/5 last:border-l-0">البيان / ملاحظات</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">طريقة الدفع</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الفرع</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">المبلغ</th>
                                    <th className="px-5 py-2.5 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto opacity-30" />
                                        </td>
                                    </tr>
                                ) : filteredExpenses.length > 0 ? (
                                    filteredExpenses.map((exp) => (
                                        <tr key={exp.id} className="table-row-premium group">
                                            <td className="px-4 py-2 text-center text-[10px] font-black border-l border-gray-100/20 last:border-l-0 table-cell-premium font-mono italic">
                                                {exp.date}
                                            </td>
                                            <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className="inline-flex px-2 py-0.5 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-[9px] font-black border border-rose-100 dark:border-rose-900/30 uppercase tracking-tight">
                                                    {exp.typeName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                                <p className="text-[11px] font-bold leading-tight table-cell-premium truncate max-w-sm">{exp.note || '---'}</p>
                                            </td>
                                            <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className="text-[9px] font-black text-gray-400">{exp.paymentMethod || 'نقدي'}</span>
                                            </td>
                                            <td className="px-4 py-2 text-center text-[10px] font-black uppercase tracking-tighter border-l border-gray-100/20 last:border-l-0 table-cell-premium">
                                                {exp.clubName}
                                            </td>
                                            <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                                <div className="text-[12px] font-black text-rose-600 dark:text-rose-400 table-cell-premium" dir="ltr">
                                                    {Number(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    <small className="text-[9px] opacity-40 ml-1">SAR</small>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => { setEditingEntry(exp); setEntryForm({ date: exp.date, amount: exp.amount.toString(), typeId: exp.typeId, note: exp.note || '', paymentMethod: exp.paymentMethod || 'نقدي' }); setShowEntryModal(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90"
                                                        title="تعديل"
                                                    >
                                                        <Edit3 className="w-4 h-4 icon-glow" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteEntry(exp.id)}
                                                        className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4 icon-glow" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs border-l border-gray-100/20 last:border-l-0">لا يوجد سجل للمصروفات حالياً</td></tr>
                                )}
                            </tbody>
                            {filteredExpenses.length > 0 && (
                                <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t border-gray-300 dark:border-slate-800">
                                    <tr className="divide-x divide-x-reverse divide-gray-300 dark:divide-slate-700">
                                        <td colSpan={5} className="px-5 py-4 text-[13px] font-black text-slate-800 dark:text-slate-200 text-left">إجمالي المصروفات المفلترة :</td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="text-[14px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 py-1 rounded-xl border border-rose-100 dark:border-rose-800" dir="ltr">
                                                {stats.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                <small className="text-[10px] opacity-60 ml-1">SAR</small>
                                            </div>
                                        </td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Entry Modal */}
                <AnimatePresence>
                    {showEntryModal && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEntryModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                                <div className="bg-rose-600 p-6 flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><CreditCard className="w-5 h-5 icon-glow" /></div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-tighter">{editingEntry ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}</h3>
                                            <p className="text-[9px] text-rose-100 font-bold uppercase tracking-widest mt-0.5">إضافة معاملة خصم مالي من الفرع</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowEntryModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                                </div>

                                <form onSubmit={handleSaveEntry} className="p-8 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">التاريخ</label>
                                            <DatePicker
                                                value={entryForm.date}
                                                onChange={(newDate) => setEntryForm({ ...entryForm, date: newDate })}
                                                className="w-full text-xs font-black bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block text-right pr-1">المبلغ (SAR)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                value={entryForm.amount}
                                                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                                                className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-rose-500/30 outline-none transition-all text-left shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">تصنيف المصروف</label>
                                            <select
                                                required
                                                value={entryForm.typeId}
                                                onChange={(e) => setEntryForm({ ...entryForm, typeId: e.target.value })}
                                                className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-rose-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="">-- اختر التصنيف --</option>
                                                {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">طريقة الدفع</label>
                                            <select
                                                value={entryForm.paymentMethod}
                                                onChange={(e) => setEntryForm({ ...entryForm, paymentMethod: e.target.value })}
                                                className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-rose-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="نقدي">نقدي</option>
                                                <option value="شبكة">شبكة</option>
                                                <option value="تحويل بنكي">تحويل بنكي</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">البيان / ملاحظات إضافية</label>
                                        <textarea
                                            rows={2}
                                            placeholder="اكتب تفاصيل المصروف هنا..."
                                            value={entryForm.note}
                                            onChange={(e) => setEntryForm({ ...entryForm, note: e.target.value })}
                                            className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-rose-500/30 outline-none transition-all resize-none shadow-inner"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button type="submit" className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95">تأكيد الحفظ</button>
                                        <button type="button" onClick={() => setShowEntryModal(false)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all">إلغاء</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Type Management Modal */}
                <AnimatePresence>
                    {showTypeModal && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTypeModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                                <div className="bg-slate-800 p-5 flex items-center justify-between text-white">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-rose-500" />
                                        <h3 className="text-xs font-black uppercase tracking-tighter">إدارة تصنيفات المصروفات</h3>
                                    </div>
                                    <button onClick={() => setShowTypeModal(false)} className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all">×</button>
                                </div>

                                <div className="p-6 space-y-5">
                                    <form onSubmit={handleSaveType} className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="اسم التصنيف الجديد..."
                                            value={typeForm.name}
                                            onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-rose-500/30 outline-none transition-all shadow-inner"
                                        />
                                        <button type="submit" className="w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-emerald-100 dark:border-emerald-900/30 group/btn active:scale-90">
                                            <Plus className="w-4 h-4 icon-glow" />
                                        </button>
                                    </form>

                                    <div className="max-h-[250px] overflow-y-auto rounded-xl ring-1 ring-gray-50 dark:ring-slate-800">
                                        <table className="w-full text-right">
                                            <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                                {expenseTypes.map((t) => (
                                                    <tr key={t.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] cursor-pointer transition-all">
                                                        <td className="px-4 py-3 text-[11px] font-black text-gray-700 dark:text-slate-300 border-l border-gray-100/20 last:border-l-0">{t.name}</td>
                                                        <td className="px-4 py-3 text-left border-l border-gray-100/20 last:border-l-0">
                                                            <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100">
                                                                <button onClick={() => { setEditingType(t); setTypeForm({ name: t.name }); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => deleteType(t.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={deleteMode === 'entry' ? "حذف عملية مصروف" : "حذف بند صرف"}
                    message={deleteMode === 'entry'
                        ? "هل أنت متأكد من حذف هذه العملية؟ لا يمكنك التراجع عن هذا الإجراء."
                        : "هل أنت متأكد من حذف هذا البند؟ قد يؤثر ذلك على تجميع البيانات المرتبطة به."}
                    confirmText={deleteMode === 'entry' ? "نعم، حذف المصروف" : "نعم، حذف البند"}
                    icon={<Trash2 className="w-6 h-6 relative z-10" />}
                />
            </div>

            {/* Printable Report Layout */}
            <div className="hidden print:block bg-white text-black rtl w-full" dir="rtl">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4">
                    <div className="flex-1 text-right">
                        <h1 className="text-xl font-black mb-1">{clubProfile?.nameAr || clubProfile?.name_ar || (user as any)?.clubName || 'تقرير النادي'}</h1>
                        <p className="text-[11px] font-bold text-slate-500 mb-0.5">تقرير المصروفات المالي</p>
                        <p className="text-[10px] font-bold text-slate-400">الاستخراج: {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}</p>
                        {viewMode === 'range' ? (
                            <p className="text-[10px] font-bold mt-1">الفترة: من {startDate} إلى {endDate}</p>
                        ) : viewMode === 'specific' ? (
                            <p className="text-[10px] font-bold mt-1">التاريخ: {selectedDate}</p>
                        ) : viewMode === 'today' ? (
                            <p className="text-[10px] font-bold mt-1">تاريخ اليوم: {new Date().toISOString().split('T')[0]}</p>
                        ) : (
                            <p className="text-[10px] font-bold mt-1">كافة المصروفات</p>
                        )}
                    </div>
                    {clubProfile?.logoUrl || clubProfile?.logo_url ? (
                        <img src={clubProfile.logoUrl || clubProfile.logo_url} className="w-16 h-16 object-contain" alt="Logo" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-black text-xl rounded-xl">FC</div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 border border-slate-200 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي المصروفات</p>
                        <p className="text-sm font-black">{stats.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</p>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">عدد العمليات</p>
                        <p className="text-sm font-black">{stats.count}</p>
                    </div>
                </div>

                <table className="w-full text-right border-collapse border border-slate-300 mb-6">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">التاريخ</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">النوع</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-right">البيان</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">الدفع</th>
                            <th className="px-2 py-1 border border-slate-300 text-[10px] font-black text-center">المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((r, idx) => (
                            <tr key={idx}>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{r.date}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{r.typeName}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold leading-relaxed">{r.note || '---'}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-bold text-center">{r.paymentMethod || 'نقدي'}</td>
                                <td className="px-2 py-1 border border-slate-300 text-[9px] font-black text-center" dir="ltr">
                                    {Number(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Payment Breakdown & Total */}
                <div className="flex justify-end mt-6">
                    <div className="w-72 space-y-2.5">
                        <div className="flex justify-between items-center p-2 border-b border-slate-200">
                            <span className="text-[10px] font-black text-slate-500">إجمالي النقدي (Cash)</span>
                            <span className="text-[11px] font-black">{filteredExpenses.filter(e => e.paymentMethod === 'نقدي').reduce((acc, e) => acc + Number(e.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b border-slate-200">
                            <span className="text-[10px] font-black text-slate-500">إجمالي الشبكة (Network)</span>
                            <span className="text-[11px] font-black">{filteredExpenses.filter(e => e.paymentMethod === 'شبكة').reduce((acc, e) => acc + Number(e.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b border-slate-200">
                            <span className="text-[10px] font-black text-slate-500">إجمالي التحويل (Transfer)</span>
                            <span className="text-[11px] font-black">{filteredExpenses.filter(e => e.paymentMethod === 'تحويل بنكي').reduce((acc, e) => acc + Number(e.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg mt-4 border-2 border-slate-900">
                            <span className="text-[11px] font-black uppercase">الإجمالي الكلي للتقرير</span>
                            <span className="text-[13px] font-black">{stats.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR</span>
                        </div>
                    </div>
                </div>

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

function MiniStatCard({ label, value, icon, color, unit = "SAR" }: any) {
    const colorClasses: any = {
        rose: 'bg-rose-50/30 dark:bg-rose-900/5 border-rose-100/30 dark:border-rose-900/20',
        amber: 'bg-amber-50/30 dark:bg-amber-900/5 border-amber-100/30 dark:border-amber-900/20',
        slate: 'bg-slate-50/30 dark:bg-slate-900/5 border-slate-300/30 dark:border-slate-800',
    };

    return (
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center justify-between transition-all hover:scale-[1.01] ${colorClasses[color]}`}>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: unit === 'SAR' ? 2 : 0 }) : value}
                    </span>
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{unit}</span>
                </div>
            </div>
            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center ring-1 ring-gray-300 dark:ring-slate-800">
                {icon}
            </div>
        </div>
    );
}
