"use client";

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Search,
    Download,
    PlusCircle,
    TrendingUp,
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
    TrendingDown,
    HandCoins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import DeleteModal from '@/components/DeleteModal';

export default function RevenuesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [revenues, setRevenues] = useState<any[]>([]);
    const [revenueTypes, setRevenueTypes] = useState<any[]>([]);
    const [filteredRevenues, setFilteredRevenues] = useState<any[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [clubFilter, setClubFilter] = useState('');
    const [clubs, setClubs] = useState<any[]>([]);

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
            const [allEntries, allTypes, allClubs] = await Promise.all([
                db.getAll('revenueEntries'),
                db.getAll('revenueTypes'),
                db.getAll('clubs')
            ]);

            setRevenueTypes(allTypes || []);
            setClubs(allClubs || []);

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

            setRevenues(finalData);
            setFilteredRevenues(finalData);
        } catch (error) {
            console.error("Error loading revenues:", error);
            // Table might not exist yet, we'll handle gracefully
            setRevenues([]);
            setFilteredRevenues([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let filtered = revenues.filter(e => {
            const matchSearch = (e.typeName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (e.note?.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchType = !typeFilter || e.typeId === typeFilter;
            const matchClub = !clubFilter || e.clubId === clubFilter;

            return matchSearch && matchType && matchClub;
        });
        setFilteredRevenues(filtered);
    }, [searchQuery, typeFilter, clubFilter, revenues]);

    const stats = {
        total: filteredRevenues.reduce((acc, e) => acc + Number(e.amount), 0),
        count: filteredRevenues.length,
        today: revenues.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((acc, e) => acc + Number(e.amount), 0)
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
                await db.update('revenueEntries', editingEntry.id, data);
            } else {
                await db.add('revenueEntries', data);
            }
            setShowEntryModal(false);
            setEditingEntry(null);
            setEntryForm({ date: new Date().toISOString().split('T')[0], amount: '', typeId: '', note: '', paymentMethod: 'نقدي' });
            loadData(user);
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ. تأكد من وجود جدول الايرادات في قاعدة البيانات.');
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
                await db.update('revenueTypes', editingType.id, data);
            } else {
                await db.add('revenueTypes', data);
            }
            setTypeForm({ name: '' });
            setEditingType(null);
            loadData(user);
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ. تأكد من وجود جدول أنواع الايرادات.');
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
            const table = deleteMode === 'entry' ? 'revenueEntries' : 'revenueTypes';
            await db.delete(table, deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            if (user) loadData(user);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">سجل ومراقبة الإيرادات</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة العمليات المالية والتدفقات النقدية الواردة</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setShowTypeModal(true)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 hover:text-emerald-600 transition-all">
                        <Settings className="w-4 h-4 icon-glow" />
                    </button>
                    <button
                        onClick={() => { setEditingEntry(null); setEntryForm({ date: new Date().toISOString().split('T')[0], amount: '', typeId: '', note: '', paymentMethod: 'نقدي' }); setShowEntryModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>تسجيل إيراد جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MiniStatCard label="إيرادات اليوم" value={stats.today} icon={<Calendar className="w-4 h-4 text-emerald-500" />} color="emerald" />
                <MiniStatCard label="إجمالي المفلتر" value={stats.total} icon={<Wallet className="w-4 h-4 text-amber-500" />} color="amber" />
                <MiniStatCard label="عدد العمليات" value={stats.count} icon={<FileText className="w-4 h-4 text-slate-500" />} color="slate" unit="معاملة" />
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="ابحث في سجل الإيرادات، الملاحظات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white"
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
                        {revenueTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-emerald-600 transition-all">
                        <Download className="w-4 h-4 icon-glow" />
                    </button>
                </div>
            </div>

            {/* Revenues Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-display-premium">
                        <thead className="table-header-premium">
                            <tr>
                                <th className="px-5 py-2.5 text-center first:rounded-tr-2xl border-l border-white/5 last:border-l-0">التاريخ</th>
                                <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">نوع الإيراد</th>
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
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto opacity-30" />
                                    </td>
                                </tr>
                            ) : filteredRevenues.length > 0 ? (
                                filteredRevenues.map((rev) => (
                                    <tr key={rev.id} className="table-row-premium group">
                                        <td className="px-4 py-2 text-center text-[10px] font-black border-l border-gray-100/20 last:border-l-0 table-cell-premium font-mono italic">
                                            {rev.date}
                                        </td>
                                        <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="inline-flex px-2 py-0.5 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-tight">
                                                {rev.typeName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                            <p className="text-[11px] font-bold leading-tight table-cell-premium truncate max-w-sm">{rev.note || '---'}</p>
                                        </td>
                                        <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="text-[9px] font-black text-gray-400">{rev.paymentMethod || 'نقدي'}</span>
                                        </td>
                                        <td className="px-4 py-2 text-center text-[10px] font-black uppercase tracking-tighter border-l border-gray-100/20 last:border-l-0 table-cell-premium">
                                            {rev.clubName}
                                        </td>
                                        <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                            <div className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 table-cell-premium" dir="ltr">
                                                {Number(rev.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                <small className="text-[9px] opacity-40 ml-1">SAR</small>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => { setEditingEntry(rev); setEntryForm({ date: rev.date, amount: rev.amount.toString(), typeId: rev.typeId, note: rev.note || '', paymentMethod: rev.paymentMethod || 'نقدي' }); setShowEntryModal(true); }}
                                                    className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90"
                                                    title="تعديل"
                                                >
                                                    <Edit3 className="w-4 h-4 icon-glow" />
                                                </button>
                                                <button
                                                    onClick={() => deleteEntry(rev.id)}
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
                                <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs border-l border-gray-100/20 last:border-l-0">لا يوجد سجل للإيرادات حالياً</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Entry Modal */}
            <AnimatePresence>
                {showEntryModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEntryModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                            <div className="bg-emerald-600 p-6 flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><HandCoins className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">{editingEntry ? 'تعديل الإيراد' : 'تسجيل إيراد جديد'}</h3>
                                        <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest mt-0.5">إضافة معاملة توريد مالي للفرع</p>
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
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-left shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">تصنيف الإيراد</label>
                                        <select
                                            required
                                            value={entryForm.typeId}
                                            onChange={(e) => setEntryForm({ ...entryForm, typeId: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            <option value="">-- اختر التصنيف --</option>
                                            {revenueTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">طريقة الدفع</label>
                                        <select
                                            value={entryForm.paymentMethod}
                                            onChange={(e) => setEntryForm({ ...entryForm, paymentMethod: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
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
                                        placeholder="اكتب تفاصيل الإيراد هنا..."
                                        value={entryForm.note}
                                        onChange={(e) => setEntryForm({ ...entryForm, note: e.target.value })}
                                        className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all resize-none shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95">تأكيد الحفظ</button>
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
                                    <Tag className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-xs font-black uppercase tracking-tighter">إدارة تصنيفات الإيرادات</h3>
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
                                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-inner"
                                    />
                                    <button type="submit" className="w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-emerald-100 dark:border-emerald-900/30 group/btn active:scale-90">
                                        <Plus className="w-4 h-4 icon-glow" />
                                    </button>
                                </form>

                                <div className="max-h-[250px] overflow-y-auto rounded-xl ring-1 ring-gray-50 dark:ring-slate-800">
                                    <table className="w-full text-right">
                                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                            {revenueTypes.map((t) => (
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
                title={deleteMode === 'entry' ? "حذف الإيراد" : "حذف تصنيف الإيراد"}
                message={deleteMode === 'entry'
                    ? "هل أنت متأكد من رغبتك في حذف هذا الإيراد؟ لا يمكن التراجع عن هذه العملية."
                    : "هل أنت متأكد من حذف هذا التصنيف؟ قد يؤثر ذلك على تجميع البيانات المرتبطة به."}
            />
        </div>
    );
}

function MiniStatCard({ label, value, icon, color, unit = "SAR" }: any) {
    const colorClasses: any = {
        emerald: 'bg-emerald-50/30 dark:bg-emerald-900/5 border-emerald-100/30 dark:border-emerald-900/20',
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
