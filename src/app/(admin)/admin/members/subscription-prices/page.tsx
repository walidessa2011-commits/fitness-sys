"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import {
    PlusCircle, Edit3, Trash2, Wallet, Loader2, Link2, DollarSign, Save, X,
    CheckCircle2, XCircle, ArrowRightLeft, Building, Clock, Info,
    Search, Filter, Activity, Layers, Calendar, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';

export default function SubscriptionPricesPage() {
    const [prices, setPrices] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [halls, setHalls] = useState<any[]>([]);
    const [revenueTypes, setRevenueTypes] = useState<any[]>([]);
    const [accessPeriods, setAccessPeriods] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPrice, setEditingPrice] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        subscriptionName: '',
        typeId: '',
        entryPeriod: 'طوال اليوم',
        revenueType: 'اشتراكات عامة',
        price: '',
        attendanceCount: '0',
        maxDiscount: '0',
        expireByCount: false,
        status: 'نشط',
        pauseFee: '0',
        pauseRevenueType: 'رسوم إيقاف',
        transferFee: '0',
        transferRevenueType: 'رسوم تنازل',
        activitiesList: [] as string[],
        clubId: ''
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.clubId) {
            setFormData(prev => ({ ...prev, clubId: user.clubId! }));
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pricesData, typesData, activitiesData, hallsData, revTypesData, periodsData] = await Promise.all([
                db.getAll('subscription_prices'),
                db.getAll('subscription_types'),
                db.getAll('activities'),
                db.getAll('halls'),
                db.getAll('revenueTypes'),
                db.getAll('access_periods').catch(() => []) // Fallback if table not ready
            ]);

            setPrices(pricesData || []);
            setTypes(typesData || []);
            setActivities(activitiesData || []);
            setHalls(hallsData || []);
            setRevenueTypes(revTypesData || []);
            setAccessPeriods(periodsData || []);

            // Set default typeId if not set
            if (typesData && typesData.length > 0 && !formData.typeId) {
                setFormData(prev => ({ ...prev, typeId: typesData[0].id }));
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivityToggle = (activityId: string) => {
        setFormData(prev => {
            const list = prev.activitiesList || [];
            if (list.includes(activityId)) {
                return { ...prev, activitiesList: list.filter(id => id !== activityId) };
            } else {
                return { ...prev, activitiesList: [...list, activityId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                attendanceCount: parseInt(formData.attendanceCount) || 0,
                maxDiscount: parseFloat(formData.maxDiscount) || 0,
                pauseFee: parseFloat(formData.pauseFee) || 0,
                transferFee: parseFloat(formData.transferFee) || 0
            };

            if (editingPrice) {
                await db.update('subscription_prices', editingPrice.id, dataToSave);
            } else {
                await db.add('subscription_prices', dataToSave);
            }

            // Reload and reset
            await loadData();
            handleReset();
            alert('تم حفظ البيانات بنجاح');
        } catch (error) {
            console.error("Save error:", error);
            alert('حدث خطأ أثناء الحفظ. تأكد من وجود كافة الحقول في قاعدة البيانات.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setEditingPrice(null);
        setFormData({
            subscriptionName: '',
            typeId: types.length > 0 ? types[0].id : '',
            entryPeriod: 'طوال اليوم',
            revenueType: 'اشتراكات عامة',
            price: '',
            attendanceCount: '0',
            maxDiscount: '0',
            expireByCount: false,
            status: 'نشط',
            pauseFee: '0',
            pauseRevenueType: 'رسوم إيقاف',
            transferFee: '0',
            transferRevenueType: 'رسوم تنازل',
            activitiesList: [],
            clubId: formData.clubId
        });
    };

    const openEdit = (p: any) => {
        setEditingPrice(p);
        setFormData({
            subscriptionName: p.subscriptionName || '',
            typeId: p.typeId || '',
            entryPeriod: p.entryPeriod || 'طوال اليوم',
            revenueType: p.revenueType || 'اشتراكات عامة',
            price: p.price?.toString() || '',
            attendanceCount: p.attendanceCount?.toString() || '0',
            maxDiscount: p.maxDiscount?.toString() || '0',
            expireByCount: !!p.expireByCount,
            status: p.status || 'نشط',
            pauseFee: p.pauseFee?.toString() || '0',
            pauseRevenueType: p.pauseRevenueType || 'رسوم إيقاف',
            transferFee: p.transferFee?.toString() || '0',
            transferRevenueType: p.transferRevenueType || 'رسوم تنازل',
            activitiesList: Array.isArray(p.activitiesList) ? p.activitiesList : (p.activityId ? [p.activityId] : []),
            clubId: p.clubId || formData.clubId
        });
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await db.delete('subscription_prices', deleteId);
                setDeleteId(null);
                setIsDeleteModalOpen(false);
                setEditingPrice(null);
                loadData();
                alert('تم حذف البيانات بنجاح');
            } catch (error: any) {
                console.error("Delete error:", error);
                alert('لا يمكن حذف هذه التسعيرة لأنها مرتبطة بسجلات أخرى نشطة.');
            }
        }
    };

    const filteredPrices = prices.filter(p => {
        const matchesSearch = (p.subscriptionName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'الكل' || p.revenueType === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">بيانات أسعار الاشتراك</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة الباقات والأسعار والأنشطة المرتبطة بها</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث في الاشتراكات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-indigo-500/20 transition-all dark:text-white w-48 shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Right Sidebar: List of Subscriptions */}
                <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">قائمة الاشتراكات</span>
                            <button onClick={handleReset} className="btn-premium btn-premium-blue w-8 h-8 flex items-center justify-center rounded-xl shadow-sm transition-all active:scale-90">
                                <PlusCircle className="w-4 h-4 icon-glow" />
                            </button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                            {loading ? (
                                <div className="py-10 flex flex-col items-center gap-2 opacity-20">
                                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                    <span className="text-[9px] font-bold">جاري التحميل...</span>
                                </div>
                            ) : filteredPrices.length > 0 ? (
                                filteredPrices.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => openEdit(p)}
                                        className={`w-full p-2 rounded-lg flex items-center justify-between text-right transition-all group ${editingPrice?.id === p.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-0.5 overflow-hidden">
                                            <span className="text-[11px] font-black truncate">{p.subscriptionName || 'بدون اسم'}</span>
                                            <span className={`text-[9px] font-bold ${editingPrice?.id === p.id ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-500'}`}>
                                                {p.price} ريال - {p.revenueType}
                                            </span>
                                        </div>
                                        <ChevronRight className={`w-3 h-3 ${editingPrice?.id === p.id ? 'rotate-90' : 'opacity-20 group-hover:opacity-100'}`} />
                                    </button>
                                ))
                            ) : (
                                <div className="py-10 text-center opacity-40 italic text-[10px]">لا توجد نتائج</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Left Section: Detailed Form */}
                <div className="lg:col-span-9 space-y-4 order-1 lg:order-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden divide-y divide-gray-400 dark:divide-slate-800">
                        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                {editingPrice ? `تعديل اشتراك: ${editingPrice.subscriptionName}` : 'بيانات اسم الاشتراك والألعاب'}
                            </h3>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                {/* Row 1 */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-2">نوع الاشتراك (المدة) : *</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                        <select
                                            required
                                            value={formData.typeId}
                                            onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none shadow-inner"
                                        >
                                            <option value="">--- من فضلك اختر نوع الاشتراك ---</option>
                                            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pr-2">فترة الدخول :</label>
                                        <a href="/admin/attendance/sessions" className="text-[10px] font-black text-indigo-600 hover:underline">إدارة الفترات</a>
                                    </div>
                                    <div className="relative group">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                        <select
                                            value={formData.entryPeriod}
                                            onChange={e => setFormData({ ...formData, entryPeriod: e.target.value })}
                                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none shadow-inner"
                                        >
                                            <option value="">-- اختر فترة الدخول --</option>
                                            <option value="طوال اليوم">طوال اليوم</option>
                                            {accessPeriods.map((ap: any) => (
                                                <option key={ap.id} value={ap.name}>{ap.name} ({ap.startTime || ap.start_time} - {ap.endTime || ap.end_time})</option>
                                            ))}
                                            {accessPeriods.length === 0 && (
                                                <>
                                                    <option value="فترة صباحية">فترة صباحية</option>
                                                    <option value="فترة مسائية">فترة مسائية</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-2">نوع الإيراد لهذا الاشتراك : *</label>
                                    <select
                                        required
                                        value={formData.revenueType}
                                        onChange={e => setFormData({ ...formData, revenueType: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none shadow-inner"
                                    >
                                        <option value="">-- اختر نوع الإيراد --</option>
                                        {revenueTypes.map(rt => (
                                            <option key={rt.id} value={rt.name}>{rt.name}</option>
                                        ))}
                                        {revenueTypes.length === 0 && (
                                            <>
                                                <option value="اشتراكات عامة">اشتراكات عامة</option>
                                                <option value="تدريب شخصي">تدريب شخصي</option>
                                                <option value="عروض خاصة">عروض خاصة</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-2">اسم الاشتراك : *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="مثال: اشتراك شهر لياقة"
                                        value={formData.subscriptionName}
                                        onChange={e => setFormData({ ...formData, subscriptionName: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                    />
                                </div>

                                {/* Row 3 */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-2">قيمة الاشتراك : *</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                        <input
                                            type="number"
                                            step="any"
                                            required
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-2">عدد مرات الحضور : *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.attendanceCount}
                                        onChange={e => setFormData({ ...formData, attendanceCount: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                    />
                                </div>

                                {/* Row 4 */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 pr-2">الحد الأقصى للخصم : *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        value={formData.maxDiscount}
                                        onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setFormData({ ...formData, expireByCount: !formData.expireByCount })}>
                                        <div className={`w-8 h-4 rounded-full relative transition-all ${formData.expireByCount ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                            <motion.div animate={{ x: formData.expireByCount ? -16 : 0 }} className="absolute top-0.5 left-0.5 rtl:right-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-tight">الحضور ينهي الباقة</span>
                                    </div>
                                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setFormData({ ...formData, status: formData.status === 'نشط' ? 'غير نشط' : 'نشط' })}>
                                        <div className={`w-8 h-4 rounded-full relative transition-all ${formData.status === 'نشط' ? 'bg-emerald-600' : 'bg-rose-500'}`}>
                                            <motion.div animate={{ x: formData.status === 'نشط' ? -16 : 0 }} className="absolute top-0.5 left-0.5 rtl:right-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-tight">مفعل</span>
                                    </div>
                                </div>
                            </div>

                            {/* Activities selection */}
                            <div className="mt-4 mb-3">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-1.5 rounded-lg mb-2.5 flex items-center justify-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-[10px] font-black text-blue-700 dark:text-blue-400">يجب اختيار الانشطة لهذا الاشتراك</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {activities.map(a => (
                                        <label key={a.id} className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-800">
                                            <div
                                                onClick={() => handleActivityToggle(a.id)}
                                                className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${formData.activitiesList?.includes(a.id)
                                                    ? 'bg-indigo-600 border-indigo-600'
                                                    : 'border-slate-300 dark:border-slate-700'
                                                    }`}
                                            >
                                                {formData.activitiesList?.includes(a.id) && <X className="w-3 h-3 text-white rotate-45" />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400 truncate">{a.name}</span>
                                                <span className="text-[7px] text-gray-400 italic">({halls.find(h => h.id === a.hallId)?.name || 'عام'})</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Fees Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                <div className="p-3 bg-amber-50/30 dark:bg-amber-900/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                                        <Layers className="w-3 h-3" />
                                        <h4 className="text-[9px] font-black uppercase tracking-widest">رسوم الإيقاف إن وجد</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <select
                                            value={formData.pauseRevenueType}
                                            onChange={e => setFormData({ ...formData, pauseRevenueType: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-[10px] font-black outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500/30 transition-all appearance-none"
                                        >
                                            <option value="">-- اختر نوع الإيراد --</option>
                                            {revenueTypes.map(rt => (
                                                <option key={rt.id} value={rt.name}>{rt.name}</option>
                                            ))}
                                            {revenueTypes.length === 0 && (
                                                <>
                                                    <option value="رسوم إيقاف">رسوم إيقاف</option>
                                                    <option value="إيرادات متنوعة">إيرادات متنوعة</option>
                                                </>
                                            )}
                                        </select>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="قيمة رسوم الإيقاف"
                                            value={formData.pauseFee}
                                            onChange={e => setFormData({ ...formData, pauseFee: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-[10px] font-black outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                        <ArrowRightLeft className="w-3 h-3" />
                                        <h4 className="text-[9px] font-black uppercase tracking-widest">رسوم التنازل إن وجد</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <select
                                            value={formData.transferRevenueType}
                                            onChange={e => setFormData({ ...formData, transferRevenueType: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-[10px] font-black outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none"
                                        >
                                            <option value="">-- اختر نوع الإيراد --</option>
                                            {revenueTypes.map(rt => (
                                                <option key={rt.id} value={rt.name}>{rt.name}</option>
                                            ))}
                                            {revenueTypes.length === 0 && (
                                                <>
                                                    <option value="رسوم تنازل">رسوم تنازل</option>
                                                    <option value="رسوم تبديل">رسوم تبديل</option>
                                                </>
                                            )}
                                        </select>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="قيمة رسوم التنازل"
                                            value={formData.transferFee}
                                            onChange={e => setFormData({ ...formData, transferFee: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-[10px] font-black outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                {editingPrice && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editingPrice.id)}
                                        className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-1.5 rounded-lg font-black text-[10px] hover:bg-rose-100 transition-all flex items-center gap-1.5"
                                    >
                                        <Trash2 className="w-3 h-3 icon-glow" /> حذف
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={handleReset} className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg font-black text-[10px] transition-all hover:bg-gray-200">تفريغ</button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-1.5 rounded-lg font-black text-[10px] shadow-sm shadow-indigo-100 dark:shadow-none transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>{editingPrice ? 'تحديث' : 'حفظ'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف تسعيرة الاشتراك"
                message="هل أنت متأكد من رغبتك في حذف هذه التسعيرة؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="نعم، حذف التسعيرة"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
