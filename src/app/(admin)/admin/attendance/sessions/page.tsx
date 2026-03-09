"use client";

import React, { useState, useEffect } from 'react';
import { db, supabase } from '@/lib/supabase';
import {
    PlusCircle, Edit3, Trash2, Clock, Loader2, Save, X,
    Search, CheckCircle2, Calendar, Building, Info, ArrowLeft,
    ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';
import Link from 'next/link';

export default function AccessPeriodsPage() {
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<any>(null);
    const [clubId, setClubId] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

    const [formData, setFormData] = useState({
        name: '',
        startTime: '08:00',
        endTime: '16:00',
        days: daysOfWeek,
        isActive: true,
        clubId: ''
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.clubId) {
            setClubId(user.clubId);
            setFormData(prev => ({ ...prev, clubId: user.clubId! }));
        }
        loadPeriods();
    }, []);

    const loadPeriods = async () => {
        setLoading(true);
        try {
            const data = await db.getAll('access_periods');
            setPeriods(data || []);
        } catch (error: any) {
            console.error("Error in loadPeriods:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPeriod) {
                await db.update('access_periods', editingPeriod.id, formData);
            } else {
                await db.add('access_periods', formData);
            }
            setIsModalOpen(false);
            setEditingPeriod(null);
            loadPeriods();
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء حفظ الفترة');
        }
    };

    const toggleDay = (day: string) => {
        setFormData(prev => {
            const newDays = prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day];
            return { ...prev, days: newDays };
        });
    };

    const openEdit = (p: any) => {
        setEditingPeriod(p);
        setFormData({
            name: p.name,
            startTime: p.startTime || p.start_time,
            endTime: p.endTime || p.end_time,
            days: p.days || daysOfWeek,
            isActive: p.isActive !== undefined ? p.isActive : (p.is_active !== undefined ? p.is_active : true),
            clubId: p.clubId || clubId
        });
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingPeriod(null);
        setFormData({
            name: '',
            startTime: '08:00',
            endTime: '16:00',
            days: daysOfWeek,
            isActive: true,
            clubId: clubId
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('access_periods', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadPeriods();
        }
    };

    const filteredPeriods = periods.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">فترات الدخول</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحديد الأوقات المسموح بها لدخول المشتركين</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-blue-500/20 transition-all dark:text-white w-48 shadow-inner"
                        />
                    </div>
                    <button onClick={openAdd} className="btn-premium btn-premium-blue bg-blue-600 dark:bg-blue-600 px-6 py-2 rounded-xl font-black text-[11px] shadow-md transition-all flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة فترة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Content Sidebar and Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 border-l border-gray-100 dark:border-slate-800 pr-2">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                        <h3 className="text-[11px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-blue-500" /> معلومات النظام
                        </h3>
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed opacity-80">
                            تستخدم فترات الدخول لربطها بأنواع الاشتراكات. يمكنك تقييد حضور المشتركين خلال ساعات محددة في اليوم أو أيام معينة من الأسبوع (صباحي، مسائي، نهاية أسبوع، إلخ).
                        </p>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {loading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-40 animate-pulse border border-gray-300 dark:border-slate-800" />
                            ))
                        ) : filteredPeriods.length > 0 ? (
                            filteredPeriods.map((p) => (
                                <motion.div
                                    layout
                                    key={p.id}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 group hover:border-blue-500/50 transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{p.name}</h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                        <Clock className="w-3 h-3 text-blue-500" />
                                                        <span>{p.startTime || p.start_time} - {p.endTime || p.end_time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${p.isActive || p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {p.isActive || p.is_active ? 'نشطة' : 'معطلة'}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <div className="flex flex-wrap gap-1">
                                            {daysOfWeek.map(day => (
                                                <span key={day} className={`text-[8px] font-black px-2 py-0.5 rounded-lg border ${p.days?.includes(day) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'}`}>
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-slate-800 pt-3 opacity-0 group-hover:opacity-100 transition-all">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">تم الإنشاء: {new Date(p.createdAt || p.created_at).toLocaleDateString()}</div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all flex items-center gap-1.5">
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black underline underline-offset-4">تعديل</span>
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all flex items-center gap-1.5">
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black underline underline-offset-4">حذف</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-300 dark:border-slate-800 text-center flex flex-col items-center gap-4 shadow-inner">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-gray-200">
                                    <Clock className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">لم يتم العثور على فترات دخول</p>
                                    <button onClick={openAdd} className="text-blue-600 font-black text-[10px] hover:underline mt-2">قم بإنشاء فترتك الأولى الآن</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
                        >
                            <div className="bg-blue-600 p-4 text-white flex justify-between items-center px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tighter">
                                        {editingPeriod ? 'تعديل فترة الدخول' : 'إضافة فترة'}
                                    </h3>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X className="w-5 h-5 text-white" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-3">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2 italic">مسمى الفترة : *</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700/50 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                            placeholder="مثال: الفترة الصباحية، عطلة الأسبوع..."
                                        />
                                    </div>

                                    {/* Times */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2 italic">وقت البدء :</label>
                                            <input
                                                type="time"
                                                required
                                                value={formData.startTime}
                                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700/50 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2 italic">وقت الانتهاء :</label>
                                            <input
                                                type="time"
                                                required
                                                value={formData.endTime}
                                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700/50 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {/* Days Selection */}
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 pr-2 italic">أيام السماح بالدخول :</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {daysOfWeek.map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${formData.days.includes(day)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-gray-400 border-gray-300 dark:border-slate-700 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${formData.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <div>
                                                <p className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest leading-none">تفعيل الفترة</p>
                                                <p className="text-[8px] font-bold text-gray-400 mt-1 italic">هل الفترة متاحة للاستخدام حالياً؟</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded-md border-slate-200 text-blue-600 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-[0.98]">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ البيانات
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-slate-100 dark:bg-slate-800 text-gray-500 py-2.5 rounded-xl font-black text-xs hover:bg-slate-200 transition-all">إلغاء</button>
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
                title="حذف فترة الدخول"
                message="هل أنت متأكد من رغبتك في حذف هذه الفترة؟ قد يؤثر ذلك على المشتركين المرتبطين بها."
                confirmText="نعم، حذف الفترة"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
