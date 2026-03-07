"use client";

import React, { useState, useEffect } from 'react';
import { db, supabase } from '@/lib/supabase';
import {
    PlusCircle, Edit3, Trash2, Activity, Dumbbell, Loader2, Save, X,
    Search, CheckCircle2, XCircle, Building, MapPin, Tag, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<any>(null);
    const [halls, setHalls] = useState<any[]>([]);
    const [clubId, setClubId] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        hallId: '',
        status: 'مفعل',
        clubId: ''
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.clubId) {
            setClubId(user.clubId);
            setFormData(prev => ({ ...prev, clubId: user.clubId! }));
        }
        loadActivities();
        loadHalls();
    }, []);

    const loadHalls = async () => {
        const data = await db.getAll('halls');
        setHalls(data || []);
    };

    const loadActivities = async () => {
        setLoading(true);
        try {
            console.log("Fetching activities...");
            const data = await db.getAll('activities');
            console.log("Activities data received:", data);

            if (!data || data.length === 0) {
                console.warn("No activities found for this club. User clubId:", auth.getCurrentUser()?.clubId);
                // Try to check if activities exist at all (for debug)
                const { data: allData, error } = await supabase.from('activities').select('id, name, club_id').limit(10);
                console.log("Global check (activities):", allData, error);
            }

            setActivities(data || []);
        } catch (error: any) {
            console.error("Error in loadActivities:", error);
            alert(`خطأ في تحميل الأنشطة: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingActivity) {
                await db.update('activities', editingActivity.id, formData);
            } else {
                await db.add('activities', formData);
            }
            setIsModalOpen(false);
            setEditingActivity(null);
            loadActivities();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (a: any) => {
        setEditingActivity(a);
        setFormData({
            name: a.name,
            hallId: a.hallId || '',
            status: a.status || 'نشط',
            clubId: a.clubId || clubId
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('activities', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadActivities();
        }
    };

    const openAdd = () => {
        setEditingActivity(null);
        setFormData({
            name: '',
            hallId: halls.length > 0 ? halls[0].id : '',
            status: 'نشط',
            clubId: clubId
        });
        setIsModalOpen(true);
    };

    const filteredActivities = activities.filter(a =>
        (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.category && a.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            {/* ultra compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">الأنشطة والألعاب</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة الأنشطة والخدمات المتاحة للعملاء</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث سيع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-indigo-500/20 transition-all dark:text-white w-48 shadow-inner"
                        />
                    </div>
                    <button onClick={openAdd} className="btn-premium btn-premium-blue px-6 py-2 rounded-xl font-black text-[11px] shadow-md transition-all flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة نشاط جديد</span>
                    </button>
                </div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 h-32 animate-pulse border border-gray-300 dark:border-slate-800" />
                    ))
                ) : filteredActivities.length > 0 ? (
                    filteredActivities.map((a) => (
                        <motion.div
                            layout
                            key={a.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 group hover:border-indigo-500/50 transition-all relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Dumbbell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">{a.name}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-gray-400 dark:text-slate-500">
                                            <MapPin className="w-3 h-3" />
                                            <span>{halls.find(h => h.id === a.hallId)?.name || a.category || a.description || 'غير محدد'}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${a.status === 'نشط' || a.status === 'مفعل'
                                    ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-600 border border-rose-200'
                                    }`}>
                                    {a.status || 'نشط'}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-gray-200 dark:border-slate-800 pt-3 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => openEdit(a)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all flex items-center gap-1.5">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black">تعديل</span>
                                </button>
                                <button onClick={() => handleDelete(a.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all flex items-center gap-1.5">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black">حذف</span>
                                </button>
                            </div>

                            {/* subtle background icon */}
                            <Activity className="absolute -bottom-2 -right-2 w-16 h-16 text-gray-50 dark:text-slate-800 opacity-50 pointer-events-none" />
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-gray-300">
                            <Activity className="w-8 h-8" />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 italic">لا توجد أنشطة مسجلة حالياً</p>
                        <button onClick={openAdd} className="text-indigo-600 font-black text-[10px] hover:underline">أضف نشاطك الأول الآن</button>
                    </div>
                )}
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
                                <h3 className="text-sm font-black flex items-center gap-2">
                                    <Activity className="w-4 h-4 icon-glow" />
                                    {editingActivity ? 'تعديل بيانات النشاط' : 'إضافة نشاط جديد'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">اسم النشاط أو اللعبة : *</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors w-3.5 h-3.5" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                                            placeholder="مثال: ملاكمة، كاراتيه..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">مكان النشاط (الصالة المسجلة) :</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors w-3.5 h-3.5" />
                                        <select
                                            value={formData.hallId}
                                            onChange={e => setFormData({ ...formData, hallId: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner appearance-none"
                                        >
                                            <option value="">-- اختر الصالة من القائمة --</option>
                                            {halls.map(h => (
                                                <option key={h.id} value={h.id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">الحالة التشغيلية :</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner appearance-none"
                                    >
                                        <option value="نشط">نشط (متاح للاشتراك)</option>
                                        <option value="غير نشط">غير نشط (معطل مؤقتاً)</option>
                                    </select>
                                </div>

                                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-3 rounded-xl flex items-start gap-3">
                                    <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">تنبيه: تعطيل النشاط سيؤثر على إمكانية إضافة اشتراكات جديدة مرتبطة به ولكنه لن يحذف الاشتراكات القائمة.</p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإغلاق
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[11px] hover:bg-gray-200 transition-all">إلغاء</button>
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
                title="حذف النشاط"
                message="هل أنت متأكد من رغبتك في حذف هذا النشاط؟ سيؤدي ذلك لإزالته نهائياً من قائمة الخدمات المتاحة."
            />
        </div>
    );
}
