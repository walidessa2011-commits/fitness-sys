"use client";

import React, { useState, useEffect } from 'react';
import {
    Target,
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    Loader2,
    Search,
    Info,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import DeleteModal from '@/components/DeleteModal';

export default function MemberGoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'نشط'
    });

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        setLoading(true);
        try {
            const data = await db.getAll('member_goals');
            setGoals(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingGoal) {
                await db.update('member_goals', editingGoal.id, formData);
            } else {
                await db.add('member_goals', formData);
            }
            setIsModalOpen(false);
            setEditingGoal(null);
            setFormData({ name: '', description: '', status: 'نشط' });
            loadGoals();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (goal: any) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            description: goal.description || '',
            status: goal.status || 'نشط'
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('member_goals', deleteId);
            setDeleteId(null);
            setIsDeleteModalOpen(false);
            loadGoals();
        }
    };

    const filteredGoals = goals.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Target className="w-5 h-5 icon-glow" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">تسجيل الأهداف والملاحظات</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة أهداف المتدربين داخل المركز</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingGoal(null);
                        setFormData({ name: '', description: '', status: 'نشط' });
                        setIsModalOpen(true);
                    }}
                    className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                    <Plus className="w-4 h-4 icon-glow" />
                    <span>إنشاء هدف جديد</span>
                </button>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="ابحث عن هدف محدد..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700/50 focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : filteredGoals.length > 0 ? (
                    filteredGoals.map((goal) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-300 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">{goal.name}</h3>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {goal.description || 'لا يوجد وصف مضاف لهذا الهدف التدريبي.'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${goal.status === 'نشط' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {goal.status}
                                </span>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span className="text-[9px] font-bold">هدف معتمد</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full h-60 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 grayscale opacity-60">
                        <Target className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-xs font-bold text-gray-400">لم يتم إضافة أي أهداف تدريبية بعد</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                                {editingGoal ? 'تعديل الهدف' : 'إضافة هدف جديد'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500">حدد الهدف التدريبي وطبيعة النشاط</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">اسم الهدف</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="مثال: زيادة الكتلة العضلية"
                                                className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-2xl text-xs font-black dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">وصف موجز</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="اكتب وصفاً مختصراً لطبيعة هذا الهدف..."
                                                className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-2xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all shadow-inner resize-none"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">الحالة</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-2xl text-xs font-black dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="نشط">نشط</option>
                                                <option value="معطل">معطل</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-100 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 icon-glow" />}
                                        حفظ البيانات
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-2xl font-black text-xs hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                                    >
                                        إلغاء
                                    </button>
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
                title="حذف الهدف التدريبي"
                message="هل أنت متأكد من رغبتك في حذف هذا الهدف؟ لن يؤثر ذلك على الأعضاء المسجلين سابقاً فيه."
                confirmText="نعم، حذف الهدف"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
