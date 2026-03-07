"use client";

import React, { useState, useEffect } from 'react';
import {
    Ticket,
    Search,
    PlusCircle,
    Edit3,
    Trash2,
    Settings,
    MoreHorizontal,
    TrendingUp,
    Calendar,
    CheckCircle2,
    XCircle,
    Loader2,
    Plus,
    X,
    LayoutGrid,
    Dumbbell,
    CircleSlash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

export default function TicketTypesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [types, setTypes] = useState<any[]>([]);
    const [revenueTypes, setRevenueTypes] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        price: '',
        validityDays: '1',
        revenueTypeId: '',
        isStadiumRental: false,
        isActive: true
    });

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadData();
    }, [router]);

    async function loadData() {
        setLoading(true);
        try {
            const [allTypes, allRevenueTypes] = await Promise.all([
                db.getAll('dailyTicketTypes'),
                db.getAll('revenueTypes')
            ]);
            setTypes(allTypes || []);
            setRevenueTypes(allRevenueTypes || []);
        } catch (error) {
            console.error("Error loading ticket types:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredTypes = types.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const data = {
            ...form,
            price: Number(form.price),
            validityDays: Number(form.validityDays),
            clubId: user.clubId || (user as any).club_id
        };

        try {
            if (editingItem) {
                await db.update('dailyTicketTypes', editingItem.id, data);
            } else {
                await db.add('dailyTicketTypes', data);
            }
            setShowModal(false);
            setEditingItem(null);
            setForm({ name: '', price: '', validityDays: '1', revenueTypeId: '', isStadiumRental: false, isActive: true });
            loadData();
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('dailyTicketTypes', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadData();
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">بيانات أنواع التذاكر اليومية</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة التذاكر وتصنيفات الدخول اليومي</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث في الأنواع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold ring-1 ring-gray-300 dark:ring-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingItem(null); setForm({ name: '', price: '', validityDays: '1', revenueTypeId: '', isStadiumRental: false, isActive: true }); setShowModal(true); }}
                        className="btn-premium btn-premium-blue bg-blue-600 dark:bg-blue-600 px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة نوع جديد</span>
                    </button>
                </div>
            </div>

            {/* Premium Table Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <table className="table-display-premium">
                    <thead className="table-header-premium">
                        <tr>
                            <th className="px-5 py-2.5 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">اسم التذكرة</th>
                            <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">قيمة التذكرة</th>
                            <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الصلاحية (أيام)</th>
                            <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">نوع الإيراد</th>
                            <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">إيجار ملاعب</th>
                            <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                            <th className="px-5 py-2.5 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                        {loading ? (
                            <tr><td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto opacity-30" /></td></tr>
                        ) : filteredTypes.length === 0 ? (
                            <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs tracking-widest uppercase opacity-40 border-l border-gray-100/20 last:border-l-0">لا توجد أنواع مسجلة حالياً</td></tr>
                        ) : (
                            filteredTypes.map((t) => (
                                <tr key={t.id} className="table-row-premium group cursor-pointer">
                                    <td className="px-6 py-3.5 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                                                <Ticket className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs text-slate-700 dark:text-slate-200">{t.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-center border-l border-gray-100/20 last:border-l-0">
                                        <div className="text-[12px] font-black text-slate-900 dark:text-white" dir="ltr">
                                            {Number(t.price).toLocaleString()} <small className="text-[9px] text-slate-400 ml-0.5">SAR</small>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-center text-xs text-slate-500 border-l border-gray-100/20 last:border-l-0">{t.validityDays} يوم</td>
                                    <td className="px-6 py-3.5 text-center border-l border-gray-100/20 last:border-l-0">
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500">
                                            {revenueTypes.find(rt => rt.id === t.revenueTypeId)?.name || '---'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center border-l border-gray-100/20 last:border-l-0">
                                        {t.isStadiumRental ? (
                                            <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">نعم</span>
                                        ) : (
                                            <span className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">لا</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 text-center border-l border-gray-100/20 last:border-l-0">
                                        {t.isActive ? (
                                            <div className="flex items-center justify-center gap-1.5 text-emerald-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px]">مفعل</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 text-rose-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                <span className="text-[10px]">غير مفعل</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex items-center justify-center gap-2 opacity-10 group-hover:opacity-100 transition-all transition-all duration-300">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(t);
                                                    setForm({
                                                        name: t.name,
                                                        price: t.price.toString(),
                                                        validityDays: t.validityDays.toString(),
                                                        revenueTypeId: t.revenueTypeId || '',
                                                        isStadiumRental: t.isStadiumRental,
                                                        isActive: t.isActive
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900 rounded-lg"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modern Modal Interface */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                            <div className="bg-blue-600 p-6 flex items-center justify-between text-white relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><Ticket className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">{editingItem ? 'تعديل بيانات التذكرة' : 'تسجيل بيانات التذكرة اليومية والإيجارات'}</h3>
                                        <p className="text-[9px] text-blue-100 font-bold uppercase tracking-widest mt-0.5">تحديد خصائص وسعر التذكرة المباشرة</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">اسم التذكرة * :</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="اسم التذكرة (مثل: دخول صباحي، إيجار ملعب ساعة...)"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">قيمة التذكرة * :</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                value={form.price}
                                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all text-left"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">SAR</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">صلاحية التذكرة بالأيام * :</label>
                                        <input
                                            type="number"
                                            required
                                            value={form.validityDays}
                                            onChange={(e) => setForm({ ...form, validityDays: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">نوع الإيراد لهذا الاشتراك :</label>
                                    <select
                                        value={form.revenueTypeId}
                                        onChange={(e) => setForm({ ...form, revenueTypeId: e.target.value })}
                                        className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">---- من فضلك اختر نوع الايراد ----</option>
                                        {revenueTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2.5 pt-2">
                                    <label className="flex items-center gap-3 group cursor-pointer w-fit">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={form.isStadiumRental}
                                                onChange={(e) => setForm({ ...form, isStadiumRental: e.target.checked })}
                                            />
                                            <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-700 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-all" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-all">إيجار ملاعب *</span>
                                    </label>

                                    <label className="flex items-center gap-3 group cursor-pointer w-fit">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={form.isActive}
                                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            />
                                            <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-700 rounded-lg peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-all" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-all">مفعل / غير مفعل *</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95">حفظ و إغلاق</button>
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all">إغلاق</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف نوع التذكرة"
                message="هل أنت متأكد من رغبتك في حذف هذا النوع؟ لا يمكن التراجع عن هذه العملية."
            />
        </div>
    );
}

