"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { PlusCircle, Edit3, Trash2, Tag, Calendar, Loader2, Save, X, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteModal from '@/components/DeleteModal';

export default function SubscriptionTypesPage() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        durationDays: 30,
        status: 'نشط'
    });

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        setLoading(true);
        const data = await db.getAll('subscription_types');
        setTypes(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await db.update('subscription_types', editingType.id, formData);
            } else {
                await db.add('subscription_types', formData);
            }
            setIsModalOpen(false);
            setEditingType(null);
            loadTypes();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (t: any) => {
        setEditingType(t);
        setFormData({ name: t.name, durationDays: t.durationDays, status: t.status });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('subscription_types', deleteId);
            setDeleteId(null);
            setIsDeleteModalOpen(false);
            loadTypes();
        }
    };

    const openAdd = () => {
        setEditingType(null);
        setFormData({ name: '', durationDays: 30, status: 'نشط' });
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* ultra compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Tag className="w-5 h-5 icon-glow" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">أنواع الاشتراكات</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة المدد الزمنية والخصائص العامة للباقات</p>
                    </div>
                </div>

                <button onClick={openAdd} className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-md transition-all flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 icon-glow" />
                    <span>إضافة نوع جديد</span>
                </button>
            </div>

            {/* Main Table - Ultra Compact Style */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">تصنيف الاشتراك</th>
                                <th className="px-6 py-4 text-center border-l border-white/5 last:border-l-0">المدة الزمنية</th>
                                <th className="px-6 py-4 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-6 py-4 text-center w-24 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الخيارات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={4} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto opacity-20" /></td></tr>
                            ) : types.length > 0 ? (
                                types.map((t) => (
                                    <tr key={t.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-colors cursor-pointer transition-all">
                                        <td className="px-6 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[12px] font-black text-slate-900 dark:text-white">{t.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                                {t.durationDays} يوم
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1 ${t.status === 'نشط' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                                                {t.status === 'نشط' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEdit(t)} className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90" title="تعديل"><Edit3 className="w-4 h-4 icon-glow" /></button>
                                                <button onClick={() => handleDelete(t.id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90" title="حذف"><Trash2 className="w-4 h-4 icon-glow" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="py-20 text-center text-[11px] font-bold text-gray-400 italic border-l border-gray-100/20 last:border-l-0">لا توجد أنواع اشتراكات مسجلة</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Modern & Compact */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="bg-[#1e40af] p-4 text-white flex justify-between items-center px-6">
                                <h3 className="text-sm font-black flex items-center gap-2"><Tag className="w-4 h-4 icon-glow" /> {editingType ? 'تعديل النوع' : 'إضافة نوع جديد'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">اسم النوع (مثال: اشتراك شهري)</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                        placeholder="مثال: اشتراك ربع سنوي"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">مدة الاشتراك بالأيام</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.durationDays}
                                        onChange={e => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">الحالة</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner appearance-none"
                                    >
                                        <option value="نشط">نشط (مفعل)</option>
                                        <option value="غير نشط">غير نشط (معطل)</option>
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإغلاق
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[11px]">إلغاء</button>
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
                title="حذف نوع الاشتراك"
                message="هل أنت متأكد من رغبتك في حذف هذا النوع؟ قد يؤثر ذلك على التكلفة المرتبطة بالاشتراكات القائمة."
                confirmText="نعم، حذف النوع"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
