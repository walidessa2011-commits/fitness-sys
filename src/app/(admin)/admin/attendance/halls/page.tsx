"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { PlusCircle, Edit3, Trash2, LayoutGrid, Loader2, Search, CheckCircle2, XCircle, Settings, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';

export default function HallsPage() {
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHall, setEditingHall] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        status: 'مفعل'
    });

    useEffect(() => {
        loadHalls();
    }, []);

    const loadHalls = async () => {
        setLoading(true);
        const data = await db.getAll('halls');
        setHalls(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const clubId = auth.getCurrentUser()?.clubId || (auth.getCurrentUser() as any)?.club_id;
            const data = {
                ...formData,
                clubId: clubId
            };

            if (editingHall) {
                const result = await db.update('halls', editingHall.id, data);
                if (result) {
                    setIsModalOpen(false);
                    setEditingHall(null);
                    loadHalls();
                }
            } else {
                const result = await db.add('halls', data);
                if (result) {
                    setIsModalOpen(false);
                    setEditingHall(null);
                    loadHalls();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (h: any) => {
        setEditingHall(h);
        setFormData({ name: h.name, status: h.status });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('halls', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadHalls();
        }
    };

    const openAdd = () => {
        setEditingHall(null);
        setFormData({ name: '', status: 'مفعل' });
        setIsModalOpen(true);
    };

    const filteredHalls = halls.filter(h => h.name.includes(searchTerm));

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* ultra compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة الصالات</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحديد مناطق الدخول والتدريب</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-indigo-500/20 transition-all dark:text-white w-40 shadow-inner"
                        />
                    </div>
                    <button onClick={openAdd} className="bg-[#1e40af] hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-[11px] shadow-md transition-all flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة صالة</span>
                    </button>
                </div>
            </div>

            {/* Main Table - Ultra Compact Style */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">اسم الصالة / القاعة</th>
                                <th className="px-6 py-4 text-center border-l border-white/5 last:border-l-0">الحالة التشغيلية</th>
                                <th className="px-6 py-4 text-center w-24 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الخيارات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={3} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto opacity-20" /></td></tr>
                            ) : filteredHalls.length > 0 ? (
                                filteredHalls.map((h) => (
                                    <tr key={h.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-colors cursor-pointer transition-all">
                                        <td className="px-6 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                <span className="text-[12px] font-black text-slate-900 dark:text-white">{h.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1 ${h.status === 'مفعل' || h.status === 'نشط' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                {h.status === 'مفعل' || h.status === 'نشط' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                                {h.status || 'مفعل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEdit(h)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(h.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-20 text-center text-[11px] font-bold text-gray-400 italic border-l border-gray-100/20 last:border-l-0">لا توجد سجلات مطابقة للبحث</td></tr>
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
                                <h3 className="text-sm font-black flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> {editingHall ? 'تعديل الصالة' : 'إضافة صالة جديدة'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">اسم الصالة / القاعة</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                        placeholder="مثال: الصالة الرئيسية"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">الحالة</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner appearance-none"
                                    >
                                        <option value="مفعل">مفعل (نشط)</option>
                                        <option value="غير مفعل">غير مفعل (معطل)</option>
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإضافة
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
                title="حذف الصالة"
                message="هل أنت متأكد من رغبتك في حذف هذه الصالة؟ سيؤدي ذلك لإزالتها نهائياً من سجلات النظام."
                confirmText="نعم، حذف الصالة"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
